import { VercelRequest, VercelResponse } from '@vercel/node';
import server, { start } from '../packages/backend/src/server-working';

let isReady = false;

export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        if (!isReady) {
            await start();
            await server.ready();
            isReady = true;
        }
        server.server.emit('request', req, res);
    } catch (err) {
        console.error('Vercel API Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
