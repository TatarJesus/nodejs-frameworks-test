const Koa = require('koa');
const Router = require('@koa/router');
const { Piscina } = require('piscina');
const path = require('path');
const { getMemoryUsage } = require('../utils/memory');

const piscina = new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'hash-worker.js'),
    maxThreads: 4,
});

const app = new Koa();
const router = new Router();

router.get('/', async (ctx) => {
    ctx.body = { message: 'Hello from Koa!', timestamp: new Date().toISOString() };
});

router.get('/hash', async (ctx) => {
    const result = await piscina.run();
    ctx.body = { message: result, timestamp: new Date().toISOString() };
});

app.use(router.routes()).use(router.allowedMethods());

setInterval(() => {
    console.log('Memory snapshot:', getMemoryUsage());
}, 5000);

app.listen(3002, () => {
    console.log('Koa server running on http://localhost:3002');
});
