import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";

import { AuthUtils } from "../utils/AuthUtils";
import { IUserPayload } from '../types/custom';

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const josePayload = await AuthUtils.verifyToken(token);
    const payload = (josePayload as any)['data'] as IUserPayload;

    req.user = payload as IUserPayload;
    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(403);
  }
};

export const checkPasswordResetAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(
      token,
      process.env.PASSWORD_RESET_TOKEN_SECRET!,
      (error, payload) => {
        if (error) {
          return res.sendStatus(403);
        }

        req.user = payload as IUserPayload;
        next();
      }
    );
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};