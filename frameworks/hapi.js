const Pyroscope = require('@pyroscope/nodejs');

Pyroscope.init({
    serverAddress: 'http://pyroscope:4040',
    appName: 'load-test-api-hapi',
    tags: {
        hostname: require('os').hostname(),
        service: 'hapi-server',
        port: '3003'
    },
    collectHeapProfiles: true,
    collectAllocObjects: true,
});

Pyroscope.start()

const Hapi = require('@hapi/hapi');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

async function startServer() {
    const server = Hapi.server({
        port: 3003,
        host: 'localhost',
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: () => ({ message: 'Hello from Hapi!', timestamp: new Date().toISOString() }),
    });

    server.route({
        method: 'GET',
        path: '/hash',
        handler: async () => {
            const result = await piscina.run();
            return { message: result, timestamp: new Date().toISOString() };
        },
    });

    setInterval(() => {
        console.log('Memory snapshot:', getMemoryUsage());
    }, 5000);

    await server.start();
    console.log('Hapi server running on %s', server.info.uri);
}

startServer();
