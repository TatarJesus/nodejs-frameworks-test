// elysia-server.mjs (обратите внимание на расширение .mjs)
import { Elysia } from 'elysia';
import { node } from '@elysiajs/node';
import { Piscina } from 'piscina';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем __dirname для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pyroscope в ES modules формате
import('@pyroscope/nodejs').then(Pyroscope => {
    Pyroscope.init({
        serverAddress: 'http://pyroscope:4040',
        appName: 'load-test-api-elysia',
        tags: {
            hostname: process.env.HOSTNAME || 'localhost',
            service: 'elysia-server',
            port: '3006'
        },
        collectHeapProfiles: true,
        collectAllocObjects: true,
    });
    Pyroscope.start();
});

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

const app = new Elysia({ adapter: node() })
    .get('/', () => ({
        message: 'Hello from Elysia!',
        timestamp: new Date().toISOString()
    }))
    .get('/hash', async () => {
        try {
            console.log('[Elysia] Hash request received');
            const hash = await piscina.run();
            console.log('[Elysia] Hash generated:', hash.substring(0, 10));
            return { message: hash, timestamp: new Date().toISOString() };
        } catch (err) {
            console.error('Piscina error:', err);
            return { error: 'Hashing failed', details: err.message };
        }
    })
    .onError(({ error, code }) => {
        console.error('Elysia error:', { code, error: error.message });
        return { error: 'Server error', code };
    });

try {
    await app.listen(3006);
    console.log('Elysia server running on http://localhost:3006');
} catch (error) {
    console.error('Failed to start Elysia server:', error);
}
