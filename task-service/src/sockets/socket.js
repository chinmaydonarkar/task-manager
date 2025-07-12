let io;

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: '*' }
  });
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });
}

function emitTaskCreated(task) {
  if (io) io.emit('taskCreated', task);
}

function emitTaskUpdated(task) {
  if (io) io.emit('taskUpdated', task);
}

module.exports = { initSocket, emitTaskCreated, emitTaskUpdated }; 