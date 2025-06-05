const autocannon = require('autocannon');
const { getUrlForPlatform } = require('../utils/urlMapper');

function handleTest(socket) {
    let testRunning = false;
    let instance = null;
    let progressInterval = null;

    socket.on('start-test', ({ platform, connections, duration }) => {
        if (testRunning) return;

        const url = getUrlForPlatform(platform);
        testRunning = true;

        try {
            instance = autocannon({
                url,
                connections,
                duration,
                method: 'GET'
            });

            const startTime = Date.now();
            progressInterval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min((elapsed / duration) * 100, 100).toFixed(1);
                socket.emit('test-update', {
                    timestamp: new Date().toISOString(),
                    progress: Number(progress),
                    running: true
                });
            }, 1000);

            instance.on('done', (result) => {
                socket.emit('test-update', {
                    reqTotal: result.requests.total,
                    reqPerSec: result.requests.average,
                    latencyMs: result.latency.average,
                    throughputKbPerSec: result.throughput.average,
                    errors: result.errors,
                    timestamp: new Date().toISOString(),
                    progress: 100,
                    running: false
                });

                socket.emit('test-complete', { message: 'Load test finished' });

                clearInterval(progressInterval);
                testRunning = false;
                instance = null;
            });

            instance.on('error', (err) => {
                clearInterval(progressInterval);
                testRunning = false;
                instance = null;

                socket.emit('test-error', {
                    message: `Load test failed: ${err.message}`,
                    timestamp: new Date().toISOString()
                });
            });

        } catch (err) {
            testRunning = false;
            instance = null;

            socket.emit('test-error', {
                message: `Unexpected error during test: ${err.message}`,
                timestamp: new Date().toISOString()
            });
        }
    });

    socket.on('cancel-test', () => {
        if (instance && testRunning) {
            instance.stop();
            clearInterval(progressInterval);
            testRunning = false;
            instance = null;

            socket.emit('test-update', {
                timestamp: new Date().toISOString(),
                progress: 0,
                running: false
            });
            socket.emit('test-cancelled', { message: 'Load test was cancelled by user.' });
        }
    });

    return () => {
        if (instance && testRunning) {
            instance.stop();
            clearInterval(progressInterval);
        }
    };
}

module.exports = { handleTest };
