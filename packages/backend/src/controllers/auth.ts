import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword, verifyPassword, generateTokens, validateEmail, validatePassword } from '../utils/auth';
import { AuthenticatedRequest } from '../middleware/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['superadmin', 'admin', 'user']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password } = loginSchema.parse(request.body);

    if (!validateEmail(email)) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid email format'
      });
    }

    const user = await db.select({
      id: users.id,
      email: users.email,
      hashedPassword: users.hashedPassword,
      role: users.role,
      firstName: users.firstName,
      lastName: users.lastName,
      isActive: users.isActive
    }).from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length || !user[0].isActive) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await verifyPassword(password, user[0].hashedPassword);
    if (!isValidPassword) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid credentials'
      });
    }

    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user[0].id));

    const { accessToken, refreshToken } = generateTokens(
      user[0].id,
      user[0].email,
      user[0].role
    );

    return reply.send({
      success: true,
      data: {
        user: {
          id: user[0].id,
          email: user[0].email,
          role: user[0].role,
          firstName: user[0].firstName,
          lastName: user[0].lastName
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password, role = 'user', firstName, lastName } = registerSchema.parse(request.body);

    if (!validateEmail(email)) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid email format'
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return reply.status(400).send({
        success: false,
        error: 'Password validation failed',
        details: passwordValidation.errors
      });
    }

    const existingUser = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length) {
      return reply.status(409).send({
        success: false,
        error: 'Email already registered'
      });
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db.insert(users)
      .values({
        email,
        hashedPassword,
        role,
        firstName,
        lastName,
        isActive: true,
        emailVerified: false
      })
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        firstName: users.firstName,
        lastName: users.lastName
      });

    const { accessToken, refreshToken } = generateTokens(
      newUser.id,
      newUser.email,
      newUser.role
    );

    return reply.status(201).send({
      success: true,
      data: {
        user: newUser,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}

import { query } from '../database';

export async function getProfile(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: 'Not authenticated'
      });
    }

    const user = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      firstName: users.firstName,
      lastName: users.lastName,
      avatar: users.avatar,
      isActive: users.isActive,
      emailVerified: users.emailVerified,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt
    }).from(users)
      .where(eq(users.id, request.user.id))
      .limit(1);

    if (!user.length) {
      return reply.status(404).send({
        success: false,
        error: 'User not found'
      });
    }

    const userData = { ...user[0] } as any;

    // Fetch role permissions
    try {
      if (userData.role === 'superadmin') {
        // Superadmin has all permissions
        userData.permissions = { isSuperadmin: true };
      } else {
        const roles = await query('SELECT permissions FROM roles WHERE name = ? LIMIT 1', [userData.role]) as any[];
        if (roles && roles.length > 0) {
          const perms = roles[0].permissions;
          userData.permissions = typeof perms === 'string' ? JSON.parse(perms) : perms;
        } else {
          userData.permissions = {};
        }
      }
    } catch (err: any) {
      request.log.warn(`Could not load permissions for role ${userData.role}: ${err.message}`);
      userData.permissions = {};
    }

    return reply.send({
      success: true,
      data: userData
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
}

export async function refreshToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = request.body as any;
    const { refreshToken } = body;

    if (!refreshToken) {
      return reply.status(400).send({
        success: false,
        error: 'Refresh token required'
      });
    }

    const decoded = request.server.jwt.verify(refreshToken) as any;

    if (decoded.type !== 'refresh') {
      return reply.status(401).send({
        success: false,
        error: 'Invalid token type'
      });
    }

    const user = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      isActive: users.isActive
    }).from(users)
      .where(eq(users.id, Number(decoded.sub)))
      .limit(1);

    if (!user.length || !user[0].isActive) {
      return reply.status(401).send({
        success: false,
        error: 'User not found or inactive'
      });
    }

    const tokens = generateTokens(
      user[0].id,
      user[0].email,
      user[0].role
    );

    return reply.send({
      success: true,
      data: tokens
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(401).send({
      success: false,
      error: 'Invalid refresh token'
    });
  }
}
