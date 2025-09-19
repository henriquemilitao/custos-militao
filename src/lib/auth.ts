// lib/auth.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function verifyTokenFromRequest(req: NextRequest) {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) throw new AuthError("Token ausente");

  const [, token] = header.split(" ");
  if (!token) throw new AuthError("Token ausente");

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não configurado");

  try {
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (err) {
    throw new AuthError("Token inválido");
  }
}
