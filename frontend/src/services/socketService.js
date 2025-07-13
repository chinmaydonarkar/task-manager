import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = process.env.VITE_TASK_SERVICE_URL || 'http://localhost:5002';
    
    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000);
        console.log(`🔄 Reconnecting in ${this.reconnectDelay}ms... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔌 Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after maximum attempts');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a task room to receive updates for that specific task
  joinTask(taskId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-task', taskId);
      console.log(`📋 Joined task room: ${taskId}`);
    } else {
      console.warn('⚠️ Cannot join task room: WebSocket not connected');
    }
  }

  // Leave a task room
  leaveTask(taskId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-task', taskId);
      console.log(`📋 Left task room: ${taskId}`);
    }
  }

  // Join multiple task rooms at once
  joinTasks(taskIds) {
    if (this.socket && this.isConnected && taskIds.length > 0) {
      this.socket.emit('join-tasks', taskIds);
      console.log(`📋 Joined ${taskIds.length} task rooms:`, taskIds);
    } else {
      console.warn('⚠️ Cannot join task rooms: WebSocket not connected or no task IDs provided');
    }
  }

  // Listen for task updates
  onTaskUpdate(callback) {
    if (this.socket) {
      this.socket.on('task-updated', (data) => {
        console.log('📝 Task updated:', data);
        callback(data);
      });
    }
  }

  // Listen for task creation
  onTaskCreated(callback) {
    if (this.socket) {
      this.socket.on('task-created', (data) => {
        console.log('➕ Task created:', data);
        callback(data);
      });
    }
  }

  // Listen for task deletion
  onTaskDeleted(callback) {
    if (this.socket) {
      this.socket.on('task-deleted', (data) => {
        console.log('🗑️ Task deleted:', data);
        callback(data);
      });
    }
  }

  // Listen for room join confirmation
  onJoinedTask(callback) {
    if (this.socket) {
      this.socket.on('joined-task', (data) => {
        console.log('✅ Joined task room:', data);
        callback(data);
      });
    }
  }

  // Listen for room leave confirmation
  onLeftTask(callback) {
    if (this.socket) {
      this.socket.on('left-task', (data) => {
        console.log('👋 Left task room:', data);
        callback(data);
      });
    }
  }

  // Listen for multiple rooms join confirmation
  onJoinedTasks(callback) {
    if (this.socket) {
      this.socket.on('joined-tasks', (data) => {
        console.log('✅ Joined multiple task rooms:', data);
        callback(data);
      });
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Remove all listeners for a specific event
  offAll(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Send custom event (for debugging)
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event: WebSocket not connected');
    }
  }
}

export default new SocketService(); 