import { VercelRequest, VercelResponse } from '@vercel/node';
import server, { start } from '../packages/backend/src/server-working';

export default async (req: VercelRequest, res: VercelResponse) => {
    // Ensure the server is initialized (addons, db, etc.)
    await start();

    // Hand off for Fastify to handle
    await server.ready();
    server.server.emit('request', req, res);
};
