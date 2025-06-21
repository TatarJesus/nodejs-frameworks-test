const { Hono } = require('hono');
const { serve } = require('@hono/node-server');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const app = new Hono();

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

app.get('/', (c) => c.json({ message: 'Hello from Hono!', timestamp: new Date().toISOString() }));

app.get('/hash', async (c) => {
    try {
        const hash = await piscina.run();
        return c.json({ message: hash, timestamp: new Date().toISOString() });
    } catch (err) {
        console.error('Piscina error:', err);
        return c.json({ error: 'Hashing failed' }, 500);
    }
});

setInterval(() => {
    console.log('[Hono] Memory snapshot:', getMemoryUsage());
}, 5000);

serve({ fetch: app.fetch, port: 3005 }, () => {
    console.log('Hono server running at http://localhost:3005');
});
