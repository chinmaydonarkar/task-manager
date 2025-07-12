const app = require('./app');
const http = require('http');
const { initSocket } = require('./sockets/socket');
const PORT = process.env.PORT || 5002;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => console.log(`Task service listening on port ${PORT}`)); 