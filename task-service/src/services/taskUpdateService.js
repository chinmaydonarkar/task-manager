const logger = require('../utils/logger');

class TaskUpdateService {
  constructor(socketServer) {
    this.socketServer = socketServer;
    logger.info('TaskUpdateService initialized');
  }

  // Called when a task is updated
  async handleTaskUpdate(taskId, updatedTask, userId) {
    try {
      // Log the update
      logger.info(`Task ${taskId} updated by user ${userId}`, {
        taskId,
        userId,
        oldStatus: updatedTask.previousStatus,
        newStatus: updatedTask.status,
        timestamp: new Date().toISOString()
      });

      // Prepare update data for broadcasting
      const updateData = {
        id: taskId,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        dueDate: updatedTask.dueDate,
        priority: updatedTask.priority,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
        previousStatus: updatedTask.previousStatus
      };

      // Broadcast to connected clients
      this.socketServer.broadcastTaskUpdate(taskId, updateData);

      return {
        success: true,
        message: 'Task update broadcasted successfully',
        data: updateData
      };
    } catch (error) {
      logger.error('Failed to broadcast task update:', error);
      return {
        success: false,
        message: 'Failed to broadcast task update',
        error: error.message
      };
    }
  }

  // Called when a task is created
  async handleTaskCreated(taskData, userId) {
    try {
      logger.info(`Task created by user ${userId}`, {
        taskId: taskData._id,
        userId,
        title: taskData.title,
        timestamp: new Date().toISOString()
      });

      const broadcastData = {
        id: taskData._id,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        user: taskData.user
      };

      this.socketServer.broadcastTaskCreated(broadcastData);

      return {
        success: true,
        message: 'Task creation broadcasted successfully',
        data: broadcastData
      };
    } catch (error) {
      logger.error('Failed to broadcast task creation:', error);
      return {
        success: false,
        message: 'Failed to broadcast task creation',
        error: error.message
      };
    }
  }

  // Called when a task is deleted
  async handleTaskDeleted(taskId, userId) {
    try {
      logger.info(`Task ${taskId} deleted by user ${userId}`, {
        taskId,
        userId,
        timestamp: new Date().toISOString()
      });

      this.socketServer.broadcastTaskDeleted(taskId);

      return {
        success: true,
        message: 'Task deletion broadcasted successfully',
        taskId
      };
    } catch (error) {
      logger.error('Failed to broadcast task deletion:', error);
      return {
        success: false,
        message: 'Failed to broadcast task deletion',
        error: error.message
      };
    }
  }

  // Called when multiple tasks are updated (bulk operations)
  async handleBulkTaskUpdate(taskUpdates, userId) {
    try {
      logger.info(`Bulk task update by user ${userId}`, {
        userId,
        taskCount: taskUpdates.length,
        timestamp: new Date().toISOString()
      });

      const results = [];
      for (const taskUpdate of taskUpdates) {
        const result = await this.handleTaskUpdate(
          taskUpdate.taskId,
          taskUpdate.data,
          userId
        );
        results.push(result);
      }

      return {
        success: true,
        message: `Bulk update completed for ${taskUpdates.length} tasks`,
        results
      };
    } catch (error) {
      logger.error('Failed to broadcast bulk task updates:', error);
      return {
        success: false,
        message: 'Failed to broadcast bulk task updates',
        error: error.message
      };
    }
  }

  // Get WebSocket server statistics
  getSocketStats() {
    return this.socketServer.getStats();
  }

  // Get connected users for a specific task
  getUsersInTask(taskId) {
    return this.socketServer.getUsersInTask(taskId);
  }

  // Get all connected users
  getConnectedUsers() {
    return this.socketServer.getConnectedUsers();
  }
}

module.exports = TaskUpdateService; 