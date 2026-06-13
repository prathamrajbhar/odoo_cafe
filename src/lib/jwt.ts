import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export interface JwtPayload {
  userId: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

export const sign = signToken;
export const verify = verifyToken;
