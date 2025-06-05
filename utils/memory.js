function getMemoryUsage() {
    const memory = process.memoryUsage();
    return {
        rssMB: Math.round(memory.rss / 1024 / 1024),
        heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024)
    };
}

module.exports = { getMemoryUsage };
