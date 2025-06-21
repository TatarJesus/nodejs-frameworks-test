const { createApp, toNodeListener } = require('h3');
const { createServer } = require('http');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const app = createApp();
const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

app.use('/', () => ({
    message: 'Hello from h3!',
    timestamp: new Date().toISOString()
}));

app.use('/hash', async () => {
    try {
        const hash = await piscina.run();
        return { message: hash, timestamp: new Date().toISOString() };
    } catch (err) {
        console.error('Piscina error:', err);
        return { error: 'Hashing failed' };
    }
});

setInterval(() => {
    console.log('[h3] Memory snapshot:', getMemoryUsage());
}, 5000);

createServer(toNodeListener(app)).listen(3007, () => {
    console.log('h3 server running at http://localhost:3007');
});
