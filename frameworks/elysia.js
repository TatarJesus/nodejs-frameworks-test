const { Elysia } = require('elysia');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const app = new Elysia();

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

app.get('/', () => ({
    message: 'Hello from Elysia!',
    timestamp: new Date().toISOString()
}));

app.get('/hash', async () => {
    try {
        const hash = await piscina.run();
        return { message: hash, timestamp: new Date().toISOString() };
    } catch (err) {
        console.error('Piscina error:', err);
        return { error: 'Hashing failed' };
    }
});

setInterval(() => {
    console.log('[Elysia] Memory snapshot:', getMemoryUsage());
}, 5000);

app.listen(3006, () => {
    console.log('Elysia server running at http://localhost:3006');
});
