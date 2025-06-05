const server = require('./server');

const PORT = 2999;
server.listen(PORT, () => {
    console.log(`Server running with Socket.IO on http://localhost:${PORT}`);
});
