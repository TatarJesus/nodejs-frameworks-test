const Fastify = require('fastify');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

const app = Fastify();

app.get('/', async (req, reply) => {
    reply.send({ message: 'Hello from Fastify!', timestamp: new Date().toISOString() });
});

app.get('/hash', async (req, reply) => {
    const result = await piscina.run();
    reply.send({ message: result, timestamp: new Date().toISOString() });
});

setInterval(() => {
    console.log('Memory snapshot:', getMemoryUsage());
}, 5000);

app.listen({ port: 3001 }, () => {
    console.log('Fastify server running on http://localhost:3001');
});
