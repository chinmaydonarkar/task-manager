const app = require('./app');
const http = require('http');
const SocketServer = require('./sockets/socketServer');
const TaskUpdateService = require('./services/taskUpdateService');

const server = http.createServer(app);
const PORT = process.env.PORT || 5050;

// Initialize WebSocket server
const socketServer = new SocketServer(server);

// Initialize task update service
const taskUpdateService = new TaskUpdateService(socketServer);

// Inject the service into the controller
const taskController = require('./controllers/taskController');
taskController.setTaskUpdateService(taskUpdateService);

server.listen(PORT, () => {
  console.log(`Task service with WebSocket listening on port ${PORT}`);
}); 