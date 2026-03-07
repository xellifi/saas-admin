import { VercelRequest, VercelResponse } from '@vercel/node';

// Use dynamic import so module-level crashes are catchable
let serverModule: any = null;
let initError: Error | null = null;

async function getServer() {
    if (initError) throw initError;
    if (serverModule) return serverModule;

    try {
        serverModule = await import('../packages/backend/src/server-working');
        await serverModule.start();
        await serverModule.default.ready();
        return serverModule;
    } catch (err) {
        initError = err instanceof Error ? err : new Error(String(err));
        console.error('Server initialization failed:', initError);
        throw initError;
    }
}

export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        const mod = await getServer();
        mod.default.server.emit('request', req, res);
    } catch (err) {
        console.error('Vercel API Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            details: err instanceof Error ? err.message : String(err)
        });
    }
};
