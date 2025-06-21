const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');
const Total = require('total4');

const port = 3008;
const app = new Total.HTTP();

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

app.route('/', function () {
    this.json({ message: 'Hello from Total.js!', timestamp: new Date().toISOString() });
});

app.route('/hash', async function () {
    try {
        const hash = await piscina.run();
        this.json({ message: hash, timestamp: new Date().toISOString() });
    } catch (err) {
        console.error('Piscina error:', err);
        this.status = 500;
        this.json({ error: 'Hashing failed' });
    }
});

setInterval(() => {
    console.log('[Total.js] Memory snapshot:', getMemoryUsage());
}, 5000);

app.http(port);
console.log(`Total.js server running at http://localhost:${port}`);
