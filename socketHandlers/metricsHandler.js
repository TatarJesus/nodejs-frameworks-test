const pidusage = require('pidusage');
const { getMemoryUsage } = require('../utils/memory');

function startMetrics(socket) {
    const interval = setInterval(async () => {
        try {
            const usage = await pidusage(process.pid);
            socket.emit('metrics', {
                cpuPercent: usage.cpu.toFixed(2),
                memoryMB: (usage.memory / 1024 / 1024).toFixed(2),
                ...getMemoryUsage(),
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.error('pidusage error:', e);
        }
    }, 1000);

    return interval;
}

module.exports = { startMetrics };
