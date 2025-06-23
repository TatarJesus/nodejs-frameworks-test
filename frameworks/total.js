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

require('total4');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

// Простой GET маршрут
ROUTE('GET /', function() {
    this.json({
        message: 'Hello from Total.js!',
        timestamp: new Date().toISOString()
    });
});

// Правильный способ для Total.js - НЕ используем async/await в ROUTE
ROUTE('GET /hash', function() {
    console.log('[Total.js] Hash request received');

    // Total.js требует явного указания, что это асинхронная операция
    const self = this;

    // Отмечаем, что ответ будет асинхронным
    self.res.writeHead(200, { 'Content-Type': 'application/json' });

    piscina.run()
        .then(hash => {
            console.log('[Total.js] Hash generated:', hash.substring(0, 10));
            const response = JSON.stringify({
                message: hash,
                timestamp: new Date().toISOString()
            });
            self.res.end(response);
        })
        .catch(err => {
            console.error('[Total.js] Piscina error:', err);
            const errorResponse = JSON.stringify({
                error: 'Hashing failed',
                details: err.message
            });
            self.res.writeHead(500, { 'Content-Type': 'application/json' });
            self.res.end(errorResponse);
        });
});

// Альтернатива - используем встроенный crypto без worker threads
ROUTE('GET /hash-sync', function() {
    console.log('[Total.js] Sync hash request received');

    try {
        const crypto = require('crypto');
        const data = Math.random().toString() + Date.now().toString();
        const hash = crypto.createHash('sha256').update(data).digest('hex');

        console.log('[Total.js] Sync hash generated:', hash.substring(0, 10));

        this.json({
            message: hash,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('[Total.js] Sync hash error:', err);
        this.status = 500;
        this.json({
            error: 'Hashing failed',
            details: err.message
        });
    }
});

// Обработка ошибок
ON('error', function(err, name, uri) {
    console.error('[Total.js] Error:', { name, uri, error: err.message });
});

setInterval(() => {
    console.log('[Total.js] Memory snapshot:', getMemoryUsage());
}, 5000);

// Запускаем сервер на порту 8000 (чтобы совпадало с тестом)
HTTP('8000');

console.log('Total.js server running on http://localhost:8000');
