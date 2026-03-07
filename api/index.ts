import { VercelRequest, VercelResponse } from '@vercel/node';
import server, { start } from '../packages/backend/src/server-working';

export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Ensure the server is initialized (addons, db, etc.)
        await start();

        // Hand off for Fastify to handle
        await server.ready();
        server.server.emit('request', req, res);
    } catch (err) {
        console.error('Vercel API Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
