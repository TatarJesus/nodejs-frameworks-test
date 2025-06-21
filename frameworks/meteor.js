const { WebApp } = require('meteor/webapp');
const { Meteor } = require('meteor/meteor');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

// Маршрут: /
WebApp.connectHandlers.use('/meteor', (req, res, next) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Hello from Meteor!',
            timestamp: new Date().toISOString()
        }));
    } else {
        next();
    }
});

// Маршрут: /hash
WebApp.connectHandlers.use('/meteor/hash', async (req, res, next) => {
    if (req.method === 'GET' && req.url === '/hash') {
        try {
            const hash = await piscina.run();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: hash, timestamp: new Date().toISOString() }));
        } catch (err) {
            console.error('[Meteor] Piscina error:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Hashing failed' }));
        }
    } else {
        next();
    }
});

// Периодическая печать памяти
setInterval(() => {
    console.log('[Meteor] Memory snapshot:', getMemoryUsage());
}, 5000);

console.log('Meteor server running on http://localhost:3009/meteor');
