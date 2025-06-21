const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { startMetrics } = require('./socketHandlers/metricsHandler');
const { handleTest } = require('./socketHandlers/testHandler');

// 1. Инициализация Pyroscope
const Pyroscope = require('@pyroscope/nodejs');
Pyroscope.init({
    serverAddress: process.env.PYROSCOPE_SERVER || 'http://localhost:4040',
    appName: 'load-test-server',
    tags: {
        service: 'load-test',
        environment: process.env.NODE_ENV || 'development'
    }
});
Pyroscope.start();

// 2. Инициализация OpenTelemetry (должен быть первым в стеке!)
require('./tracing');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://ui.gpt-tech.ru', 'http://localhost:4040', 'http://localhost:4318'],
        methods: ['GET', 'POST']
    }
});

// 3. Middleware для отслеживания HTTP-запросов
app.use((req, res, next) => {
    const activeSpan = Pyroscope.getContext().get('otel-span');
    if (activeSpan) {
        activeSpan.updateName(`${req.method} ${req.path}`);
        activeSpan.setAttributes({
            'http.route': req.route?.path || req.path,
            'http.client': req.headers['user-agent'] || 'unknown'
        });
    }
    next();
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 4. Добавление тегов для профилирования
    Pyroscope.tagWrapper({ socket_id: socket.id }, () => {
        const metricsInterval = startMetrics(socket);
        const cleanupTest = handleTest(socket);

        socket.on('disconnect', () => {
            clearInterval(metricsInterval);
            cleanupTest();
            console.log('Client disconnected:', socket.id);
        });
    });
});

// 5. Экспорт метрик для Prometheus (если нужно)
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', Pyroscope.encoder.Prometheus.exportType);
    res.end(await Pyroscope.encoder.Prometheus.export());
});

module.exports = server;
