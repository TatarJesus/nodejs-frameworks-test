const Pyroscope = require('@pyroscope/nodejs');

Pyroscope.init({
    serverAddress: 'http://pyroscope:4040',
    appName: 'load-test-api-express',
    tags: {
        hostname: require('os').hostname(),
        service: 'express-server',
        port: '3000'
    },
    collectHeapProfiles: true,
    collectAllocObjects: true,
});

Pyroscope.start()

const express = require('express');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

const app = express();

app.get('/', (req, res) => {
    res.json({
        message: 'Hello from Express!',
        timestamp: new Date().toISOString()
    });
});

app.get('/hash', async (req, res) => {
    try {
        const hash = await piscina.run();
        res.json({ message: hash, timestamp: new Date().toISOString() });
    } catch (err) {
        console.error('Piscina worker error:', err);
        res.status(500).json({ error: 'Hashing failed' });
    }
});

setInterval(() => {
    console.log('Memory snapshot:', getMemoryUsage());
}, 5000);

app.listen({ port: 3000 }, () => {
    console.log('Express server running on http://localhost:3000');
});
