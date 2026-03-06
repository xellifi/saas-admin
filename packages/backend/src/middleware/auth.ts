import { FastifyRequest, FastifyReply } from 'fastify';
import { getUserByEmail } from '../database';

export interface AuthenticatedRequest extends FastifyRequest {
  user: any;
}

export async function authenticate(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    const payload = request.user as any;
    if (!payload?.sub) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid token'
      });
    }

    const user = await getUserByEmail(payload.email);

    if (!user || !(user.is_active !== undefined ? user.is_active : user.isActive)) {
      return reply.status(401).send({
        success: false,
        error: 'User not found or inactive'
      });
    }

    (request as any).user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized'
    });
  }
}

export function requireRole(allowedRoles: string[]) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: 'Insufficient permissions'
      });
    }
  };
}

export const requireSuperAdmin = requireRole(['superadmin']);
export const requireAdmin = requireRole(['superadmin', 'admin']);
export const requireUser = requireRole(['superadmin', 'admin', 'user']);
