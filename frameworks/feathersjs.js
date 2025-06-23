const Pyroscope = require('@pyroscope/nodejs');

Pyroscope.init({
    serverAddress: 'http://pyroscope:4040',
    appName: 'load-test-api-feathers',
    tags: {
        hostname: require('os').hostname(),
        service: 'feathers-server',
        port: '3004'
    },
    collectHeapProfiles: true,
    collectAllocObjects: true,
});

Pyroscope.start()

const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const app = express(feathers());
const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

// Настройка Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.configure(express.rest());

// Создание сервиса для hash
class HashService {
    async find(params) {
        const result = await piscina.run();
        return { message: result, timestamp: new Date().toISOString() };
    }

    async get(id, params) {
        const result = await piscina.run();
        return { message: result, timestamp: new Date().toISOString() };
    }
}

// Регистрация сервисов
app.use('/hash', new HashService());

// Корневой маршрут (можно оставить как Express middleware)
app.use('/', (req, res, next) => {
    if (req.method === 'GET' && req.path === '/') {
        res.json({ message: 'Hello from FeathersJS!', timestamp: new Date().toISOString() });
    } else {
        next();
    }
});

// Настройка обработки ошибок
app.use(express.errorHandler());

setInterval(() => {
    console.log('Memory snapshot:', getMemoryUsage());
}, 5000);

const server = app.listen(3004, () => {
    console.log('FeathersJS server running on http://localhost:3004');
});
