function getUrlForPlatform(platform) {
    switch (platform) {
        case 'fastify': return 'http://localhost:3001/hash';
        case 'koa': return 'http://localhost:3002/hash';
        case 'hapi': return 'http://localhost:3003/hash';
        case 'feathers': return 'http://localhost:3004/hash';
        case 'express':
        default: return 'http://localhost:3000/hash';
    }
}

module.exports = { getUrlForPlatform };
