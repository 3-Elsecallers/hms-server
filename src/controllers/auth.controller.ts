import { Request, Response } from "express";
import argon2 from "argon2";
import * as jose from "jose";
import "dotenv/config";

import { prisma } from '../lib/prisma';
import { IEmailVerificationEvent, IPasswordResetEvent, IUserPayload } from "../types/custom";
import { AuthUtils } from "../utils/AuthUtils";
import { logAuditEvent } from "../services/audit.service";
import { signInValidation, signUpValidation, updateProfileValidation } from "../validation/authValidation";
import { sendEmailVerificationEvent, sendPasswordResetEvent } from "../kafka/userManagementProducer";
import { generatePasswordResetToken } from "../utils/generateToken";

const signUp = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    const validation = signUpValidation(req.body);
    if (!validation.valid) return res.status(400).json({ errors: validation.errors });

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(401).json({ error: "User with email exists" });
    }

    const existingPhoneNumber = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existingPhoneNumber) {
      return res.status(401).json({ error: "User with phone number exists" });
    }

    const hashedPassword = await argon2.hash(password);

    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword, phoneNumber, lastLogin: new Date() }
    });

    const payload: IUserPayload = {
      id: newUser.id,
      name: `${newUser.firstName} ${newUser.lastName}`,
      email: newUser.email,
      emailVerified: newUser.emailVerified,
      role: newUser.role,
    };
    const accessToken = await AuthUtils.generateAccessToken(payload);
    const refreshToken = await AuthUtils.generateRefreshToken(payload);

    await prisma.refreshToken.create({ data: { token: refreshToken } });

    await logAuditEvent({
      userId: newUser.id,
      action: 'SIGN_UP',
      entityName: "User",
      entityId: newUser.id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const validation = signInValidation(req.body);
    if (!validation.valid) return res.status(400).json({ errors: validation.errors });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await logAuditEvent({
        action: 'SIGN_IN_FAILED',
        entityName: "User",
        ipAddress: req.ip,
      });

      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      await logAuditEvent({
        action: 'SIGN_IN_FAILED',
        entityName: "User",
        ipAddress: req.ip,
      });

      return res.status(401).json({ error: "Invalid email or password" });
    }

    const payload: IUserPayload = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
    };
    const accessToken = await AuthUtils.generateAccessToken(payload);
    const refreshToken = await AuthUtils.generateRefreshToken(payload);

    await prisma.refreshToken.create({ data: { token: refreshToken } });

    await logAuditEvent({
      userId: user.id,
      action: 'SIGN_IN_SUCCESSFUL',
      entityName: "User",
      entityId: user.id,
      ipAddress: req.ip,
    });

    await prisma.user.update({
      where: { email },
      data: { lastLogin: new Date() }
    });

    return res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const updateToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.sendStatus(401);
    }

    const refreshToken = await prisma.refreshToken.findFirst({ where: { token } });
    if (!refreshToken) {
      return res.sendStatus(403);
    }

    const josePayload = await AuthUtils.verifyToken(token);
    const payload = (josePayload as any)['data'] as IUserPayload;

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    const accessToken = await AuthUtils.generateAccessToken({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    } as IUserPayload);

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const data = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const payload = req.body ?? {};

    const { valid, errors } = updateProfileValidation(payload);
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: payload.firstName ? payload.firstName : user.firstName,
        lastName: payload.lastName ? payload.lastName : user.lastName,
        updatedAt: new Date()
      }
    });

    const accessToken = await AuthUtils.generateAccessToken({
      id: updatedUser.id,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      email: updatedUser.email,
      role: updatedUser.role,
    } as IUserPayload);

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

const requestEmailVerification = async (req: Request, res: Response) => {
  try {
    const { id, email } = req.user!;

    await sendEmailVerification(id, email);

    return res.status(200).json({
      message: `Email verification code sent to ${email} successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Verification code is required" });
    }

    const verificationCode = await prisma.verificationCode.findUnique({ where: { code } });
    if (!verificationCode || Date.now() > verificationCode.expiresAt) {
      return res
        .status(401)
        .json({ error: "Invalid or expired verification code" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
        updatedAt: new Date()
      }
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const signOut = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.sendStatus(400);
    }

    const josePayload = await AuthUtils.verifyToken(token);
    const payload = (josePayload as any)['data'] as IUserPayload;

    const refreshToken = await prisma.refreshToken.findFirst({ where: { token } });
    if (!refreshToken) {
      await logAuditEvent({
        userId: payload.id,
        action: 'SIGN_OUT_FAILED',
        entityName: "User",
        entityId: payload.id,
        ipAddress: req.ip,
      });

      return res.sendStatus(404);
    }

    await prisma.refreshToken.delete({ where: { id: refreshToken.id } });

    await logAuditEvent({
      userId: payload.id,
      action: 'SIGN_OUT_SUCCESSFUL',
      entityName: "User",
      entityId: payload.id,
      ipAddress: req.ip,
    });

    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const jwksEndpoint = async (req: Request, res: Response) => {
  const publicKey = await jose.importSPKI(process.env.PUBLIC_KEY_PEM!, 'RS256');

  // Convert the public key to JWK format
  const jwk = await jose.exportJWK(publicKey);

  res.json({
    keys: [
      {
        ...jwk,
        kid: process.env.JWK_KEY_ID,
        use: 'sig',
        alg: 'RS256',
      }
    ]
  });
}

const sendEmailVerification = async (userId: string, email: string) => {
  try {
    const code = (Math.floor(Math.random() * 90000) + 10000).toString();
    const event: IEmailVerificationEvent = {
      type: "email_verification",
      userId,
      email,
      verificationCode: code,
    };

    await prisma.verificationCode.create({ data: { code } });

    await sendEmailVerificationEvent(event);
  } catch (error) {
    console.log(error);
  }
  // TODO: Clear verification codes from database upon expiry
}

const sendPasswordResetLink = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    const payload: IUserPayload = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
    };
    const token = generatePasswordResetToken(payload);
    await prisma.passwordResetToken.create({ data: { token } });

    const event: IPasswordResetEvent = {
      type: "password_reset",
      userId: user.id,
      email,
      passwordResetLink: `http://${process.env.CLIENT_URL}/password-reset?token=${token}`,
    };

    await sendPasswordResetEvent(event);

    return res.status(200).json({
      message: `Password reset link sent to ${email} successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    let passwordError;
    if (!password || password.trim() === "") {
      passwordError = "Password is required";
    } else {
      if (password.length < 8) {
        passwordError = "Password should be a minimum of 8 digits";
      }
    }

    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const hashedPassword = await argon2.hash(password);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export default {
  signUp,
  signIn,
  updateToken,
  data,
  updateProfile,
  requestEmailVerification,
  verifyEmail,
  signOut,
  jwksEndpoint,
  sendPasswordResetLink,
  resetPassword
};