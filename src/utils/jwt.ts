import jwt from "jsonwebtoken";
import { config } from "../config";
import { JwtPayload } from "../types";

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
}
