// server.js
const Pyroscope = require('@pyroscope/nodejs');

Pyroscope.init({
    serverAddress: 'http://pyroscope:4040',
    appName: 'load-test-api',
    tags: { hostname: require('os').hostname() },
    collectHeapProfiles: true,
    collectAllocObjects: true,
});

Pyroscope.start()

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { startMetrics } = require('./socketHandlers/metricsHandler');
const { handleTest } = require('./socketHandlers/testHandler');

// 1. Инициализация OpenTelemetry (обязательно первым!)


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'https://ui.gpt-tech.ru',
            'http://localhost:4040',
            'http://localhost:4318'
        ],
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    const metricsInterval = startMetrics(socket);
    const cleanupTest = handleTest(socket);

    socket.on('disconnect', () => {
        clearInterval(metricsInterval);
        cleanupTest();
        console.log('Client disconnected:', socket.id);
    });
});

app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send('# Metrics endpoint (Prometheus compatible). Use separate collector for real metrics.');
});

module.exports = server;
