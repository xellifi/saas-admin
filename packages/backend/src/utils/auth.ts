// @ts-nocheck
import bcrypt from 'bcrypt';
import { JWT } from '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: string; type: string };
  }
}

// We need a way to sign tokens without the full fastify instance in utils
// but since we are using @fastify/jwt, we should ideally use the instance.
// For now, let's just use a simple mock or fix the'jsonwebtoken' dependency.
// Actually, let's just use 'jsonwebtoken' and I will INSTALL it if it's missing.
import * as jsonwebtoken from 'jsonwebtoken';
const jwt = jsonwebtoken;

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateTokens(userId: number, email: string, role: string) {
  const secret = process.env.JWT_SECRET || 'mySaaSsupersecret2026keychangeinprod';

  const accessToken = jwt.sign({
    sub: userId.toString(),
    email,
    role,
    type: 'access'
  }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  const refreshToken = jwt.sign({
    sub: userId.toString(),
    email,
    role,
    type: 'refresh'
  }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });

  return { accessToken, refreshToken };
}

export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `TK-${timestamp}-${random}`.toUpperCase();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
