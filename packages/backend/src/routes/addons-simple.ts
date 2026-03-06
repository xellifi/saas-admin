import { FastifyInstance } from 'fastify';

export default async function addonRoutes(fastify: FastifyInstance) {
  // Get all addons
  fastify.get('/addons', async (request, reply) => {
    return { addons: [] };
  });

  // Upload addon (placeholder)
  fastify.post('/addons/upload', async (request, reply) => {
    return { message: 'Addon upload temporarily disabled' };
  });

  // Install addon (placeholder)
  fastify.post('/addons/:id/install', async (request, reply) => {
    return { message: 'Addon install temporarily disabled' };
  });

  // Get addon details
  fastify.get('/addons/:id', async (request, reply) => {
    return { addon: null };
  });

  // Uninstall addon
  fastify.delete('/addons/:id', async (request, reply) => {
    return { message: 'Addon uninstall temporarily disabled' };
  });
}
