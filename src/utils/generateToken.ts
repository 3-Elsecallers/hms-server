import jwt from "jsonwebtoken";
import fs from "fs";
import * as jose from "jose";
import "dotenv/config";

import { IUserPayload } from "../types/custom";

export const generateAccessToken = async (payload: IUserPayload) => {
  const privateKey = await jose.importPKCS8(process.env.PRIVATE_KEY_PEM!, 'RS256');

  const jwt = await new jose.SignJWT({
    ...payload
  })
    .setExpirationTime('15 minutes')
    .setProtectedHeader({ alg: 'RS256', kid: process.env.JWK_KEY_ID })
    .setIssuedAt()
    .setIssuer('https://your-hms-api.com') // Must match EHRBase Env
    .setSubject(payload.id)
    .sign(privateKey);

  return jwt;
};

export const generateRefreshToken = async (payload: IUserPayload) => {
  const privateKey = await jose.importPKCS8(process.env.PRIVATE_KEY_PEM!, 'RS256');

  const jwt = await new jose.SignJWT({
    ...payload
  })
    .setExpirationTime('7 days')
    .setProtectedHeader({ alg: 'RS256', kid: process.env.JWK_KEY_ID })
    .setIssuedAt()
    .setIssuer('https://your-hms-api.com') // Must match EHRBase Env
    .setSubject(payload.id)
    .sign(privateKey);

  return jwt;
};