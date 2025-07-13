const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class SocketServer {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    
    this.connectedUsers = new Map(); // userId -> socketId
    this.userRooms = new Map(); // userId -> Set of taskIds
    this.socketUsers = new Map(); // socketId -> userId
    
    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('WebSocket server initialized');
  }

  setupMiddleware() {
    // Authenticate WebSocket connections
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        logger.warn('WebSocket connection attempt without token');
        return next(new Error('Authentication error: No token provided'));
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.userId = decoded.id;
        socket.userEmail = decoded.email;
        next();
      } catch (error) {
        logger.warn('WebSocket authentication failed:', error.message);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User ${socket.userId} (${socket.userEmail}) connected`);
      
      // Track connected user
      this.connectedUsers.set(socket.userId, socket.id);
      this.socketUsers.set(socket.id, socket.userId);
      
      // Handle joining task rooms
      socket.on('join-task', (taskId) => {
        socket.join(`task-${taskId}`);
        this.addUserToTask(socket.userId, taskId);
        logger.info(`User ${socket.userId} joined task room: ${taskId}`);
        
        // Send confirmation to client
        socket.emit('joined-task', { taskId, success: true });
      });
      
      // Handle leaving task rooms
      socket.on('leave-task', (taskId) => {
        socket.leave(`task-${taskId}`);
        this.removeUserFromTask(socket.userId, taskId);
        logger.info(`User ${socket.userId} left task room: ${taskId}`);
        
        // Send confirmation to client
        socket.emit('left-task', { taskId, success: true });
      });
      
      // Handle joining multiple tasks at once
      socket.on('join-tasks', (taskIds) => {
        taskIds.forEach(taskId => {
          socket.join(`task-${taskId}`);
          this.addUserToTask(socket.userId, taskId);
        });
        logger.info(`User ${socket.userId} joined ${taskIds.length} task rooms`);
        
        socket.emit('joined-tasks', { taskIds, success: true });
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.userId);
        this.socketUsers.delete(socket.id);
        this.removeUserFromAllTasks(socket.userId);
        logger.info(`User ${socket.userId} disconnected`);
      });
      
      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for user ${socket.userId}:`, error);
      });
    });
  }

  // Broadcast task update to all users viewing that task
  broadcastTaskUpdate(taskId, updateData) {
    const room = `task-${taskId}`;
    const roomSize = this.io.sockets.adapter.rooms.get(room)?.size || 0;
    
    logger.info(`Broadcasting task update for task ${taskId} to ${roomSize} users`);
    
    this.io.to(room).emit('task-updated', {
      taskId,
      ...updateData,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast task creation to all connected users
  broadcastTaskCreated(taskData) {
    logger.info(`Broadcasting task creation: ${taskData.title}`);
    
    this.io.emit('task-created', {
      ...taskData,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast task deletion
  broadcastTaskDeleted(taskId) {
    logger.info(`Broadcasting task deletion: ${taskId}`);
    
    this.io.emit('task-deleted', {
      taskId,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users for a specific task
  getUsersInTask(taskId) {
    const room = `task-${taskId}`;
    const roomSockets = this.io.sockets.adapter.rooms.get(room);
    
    if (!roomSockets) return [];
    
    return Array.from(roomSockets).map(socketId => ({
      socketId,
      userId: this.socketUsers.get(socketId)
    })).filter(user => user.userId);
  }

  // Get all connected users
  getConnectedUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, socketId]) => ({
      userId,
      socketId
    }));
  }

  // Get user's active tasks
  getUserTasks(userId) {
    return this.userRooms.has(userId) 
      ? Array.from(this.userRooms.get(userId))
      : [];
  }

  addUserToTask(userId, taskId) {
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId).add(taskId);
  }

  removeUserFromTask(userId, taskId) {
    if (this.userRooms.has(userId)) {
      this.userRooms.get(userId).delete(taskId);
    }
  }

  removeUserFromAllTasks(userId) {
    this.userRooms.delete(userId);
  }

  // Get server statistics
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      totalRooms: this.io.sockets.adapter.rooms.size,
      userRooms: Object.fromEntries(
        Array.from(this.userRooms.entries()).map(([userId, tasks]) => [
          userId, 
          Array.from(tasks)
        ])
      )
    };
  }
}

module.exports = SocketServer; 