const Pyroscope = require('@pyroscope/nodejs');

Pyroscope.init({
    serverAddress: 'http://pyroscope:4040',
    appName: 'load-test-api-h3',
    tags: {
        hostname: require('os').hostname(),
        service: 'h3-server',
        port: '3007'
    },
    collectHeapProfiles: true,
    collectAllocObjects: true,
});

Pyroscope.start();

const { createApp, toNodeListener, defineEventHandler, createError } = require('h3');
const { createServer } = require('http');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const app = createApp();
const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

// Обработчик корневого роута
app.use('/', defineEventHandler(async (event) => {
    // Проверяем путь и метод
    if (event.node.req.url === '/' && event.node.req.method === 'GET') {
        return {
            message: 'Hello from h3!',
            timestamp: new Date().toISOString()
        };
    }
}));

// Обработчик роута /hash
app.use('/hash', defineEventHandler(async (event) => {
    if (event.node.req.method === 'GET') {
        try {
            const hash = await piscina.run();
            return {
                message: hash,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            console.error('Piscina error:', err);
            throw createError({
                statusCode: 500,
                statusMessage: 'Hashing failed',
                data: { error: err.message }
            });
        }
    }
}));

// Глобальная обработка ошибок
app.use(defineEventHandler(async (event) => {
    try {
        // Если запрос не обработан выше, возвращаем 404
        if (!event.handled) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found'
            });
        }
    } catch (error) {
        console.error('Global error:', error);
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error'
        });
    }
}));

// Мониторинг памяти
setInterval(() => {
    console.log('[h3] Memory snapshot:', getMemoryUsage());
}, 5000);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await piscina.destroy();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await piscina.destroy();
    process.exit(0);
});

// Запуск сервера
const server = createServer(toNodeListener(app));

server.listen(3007, () => {
    console.log('h3 server running at http://localhost:3007');
});

// Обработка ошибок сервера
server.on('error', (err) => {
    console.error('Server error:', err);
});

module.exports = { app, server, piscina };
