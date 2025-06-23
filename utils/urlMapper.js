function getUrlForPlatform(platform) {
    switch (platform) {
        case 'fastify': return 'http://localhost:3001';
        case 'koa': return 'http://localhost:3002';
        case 'hapi': return 'http://localhost:3003';
        case 'feathers': return 'http://localhost:3004';
        case 'hono': return 'http://localhost:3005';
        case 'elysia': return 'http://localhost:3006';
        case 'h3': return 'http://localhost:3007';
        case 'total': return 'http://localhost:8000';
        case 'express':
        default: return 'http://localhost:3000';
    }
}

module.exports = { getUrlForPlatform };
