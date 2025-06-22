const Pyroscope = require('@pyroscope/nodejs');

Pyroscope.init({
    serverAddress: 'http://pyroscope:4040',
    appName: 'load-test-api-total',
    tags: {
        hostname: require('os').hostname(),
        service: 'total-server',
        port: '8000'
    },
    collectHeapProfiles: true,
    collectAllocObjects: true,
});

Pyroscope.start()

require('total4')
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const port = 3008;

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

// Регистрируем маршруты через server.route
ROUTE('GET /', (req, res) => {
    res.json({ message: 'Hello from Total.js!', timestamp: new Date().toISOString() });
});

ROUTE('GET /hash', async (req, res) => {
    try {
        const hash = await piscina.run();
        res.json({ message: hash, timestamp: new Date().toISOString() });
    } catch (err) {
        console.error('Piscina error:', err);
        res.statusCode = 500;
        res.json({ error: 'Hashing failed' });
    }
});

setInterval(() => {
    console.log('[Total.js] Memory snapshot:', getMemoryUsage());
}, 5000);

HTTP('3008');

