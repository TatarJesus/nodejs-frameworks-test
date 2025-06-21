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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.rest());

app.get('/', (req, res) => {
    res.json({ message: 'Hello from FeathersJS!', timestamp: new Date().toISOString() });
});

app.get('/hash', async (req, res) => {
    const result = await piscina.run();
    res.json({ message: result, timestamp: new Date().toISOString() });
});

setInterval(() => {
    console.log('Memory snapshot:', getMemoryUsage());
}, 5000);

const server = app.listen(3004, () => {
    console.log('FeathersJS server running on http://localhost:3004');
});


