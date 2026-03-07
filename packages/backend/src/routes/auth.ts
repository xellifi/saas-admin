import { FastifyInstance } from 'fastify';
import { login, register, getProfile, refreshToken, testHash } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', {
    schema: {
      description: 'User login',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' }
                  }
                },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, login);

  fastify.post('/register', {
    schema: {
      description: 'User registration',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          role: { type: 'string', enum: ['superadmin', 'admin', 'user'] },
          firstName: { type: 'string' },
          lastName: { type: 'string' }
        }
      }
    }
  }, register);

  fastify.get('/profile', {
    preHandler: [authenticate],
    schema: {
      description: 'Get user profile',
      tags: ['Authentication'],
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      }
    }
  }, getProfile);

  fastify.post('/refresh', {
    schema: {
      description: 'Refresh access token',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' }
        }
      }
    }
  }, refreshToken);

  fastify.post('/test-hash', {
    schema: {
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' }
        }
      }
    }
  }, testHash);
}
