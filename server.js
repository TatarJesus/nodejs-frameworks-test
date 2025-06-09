const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { startMetrics } = require('./socketHandlers/metricsHandler');
const { handleTest } = require('./socketHandlers/testHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://ui.gpt-tech.ru'],
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

module.exports = server;
