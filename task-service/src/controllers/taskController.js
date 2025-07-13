const Task = require('../models/Task');
const path = require('path');
const fs = require('fs');
const emailService = require('../services/emailService');
const { Parser } = require('json2csv');

// Task update service for real-time updates
let taskUpdateServiceInstance;

const setTaskUpdateService = (service) => {
  taskUpdateServiceInstance = service;
};

exports.setTaskUpdateService = setTaskUpdateService;

exports.getTaskUpdateService = () => {
  return taskUpdateServiceInstance;
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    
    // Create task first to get the taskId
    const task = await Task.create({
      title,
      description,
      dueDate,
      user: req.user.id
    });
    
    let files = [];
    if (req.files && req.files.length > 0) {
      // Create folder structure: /uploads/userId/taskId/
      const uploadDir = path.join(__dirname, '../../uploads', req.user.id.toString(), task._id.toString());
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      
      files = await Promise.all(req.files.map(async (file) => {
        const filename = `${Date.now()}_${file.originalname}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, file.buffer);
        return {
          filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${req.user.id}/${task._id}/${filename}`
        };
      }));
      
      // Update task with files
      task.files = files;
      await task.save();
    }
    
    // Send email notification for task creation
    try {
      const userEmail = req.user.email || req.user.id;
      const userName = req.user.name || 'User';
      
      await emailService.sendTaskCreatedNotification(
        userEmail,
        userName,
        {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate
        }
      );
    } catch (emailError) {
      console.log('Email notification failed (non-blocking):', emailError.message);
      // Don't fail the task creation if email fails
    }

    // Broadcast real-time update if service is available
    if (taskUpdateServiceInstance) {
      try {
        await taskUpdateServiceInstance.handleTaskCreated(task, req.user.id);
      } catch (socketError) {
        console.log('Real-time update failed (non-blocking):', socketError.message);
        // Don't fail the task creation if real-time update fails
      }
    }

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json({
      success: true,
      data: tasks,
      message: 'Tasks retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get tasks', error: err.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({
      success: true,
      data: task,
      message: 'Task retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get task', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    // Handle both JSON and FormData
    const updateData = {};
    
    // Extract fields from req.body (works for both JSON and FormData)
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.dueDate !== undefined) updateData.dueDate = req.body.dueDate;
    
    console.log('Update data received:', updateData);
    
    // Get the current task to track status changes
    const currentTask = await Task.findById(req.params.id);
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Store previous status for comparison
    const previousStatus = currentTask.status;
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true }
    );
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      const uploadDir = path.join(__dirname, '../../uploads', req.user.id.toString(), task._id.toString());
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      
      const files = await Promise.all(req.files.map(async (file) => {
        const filename = `${Date.now()}_${file.originalname}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, file.buffer);
        return {
          filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${req.user.id}/${task._id}/${filename}`
        };
      }));
      
      // Add new files to existing files
      task.files = [...(task.files || []), ...files];
      await task.save();
    }
    
    // Send email if status changed to completed
    if (updateData.status === 'Completed') {
      try {
        const userEmail = req.user.email || req.user.id;
        const userName = req.user.name || 'User';
        
        await emailService.sendTaskCompletedNotification(
          userEmail,
          userName,
          {
            title: task.title,
            description: task.description
          }
        );
      } catch (emailError) {
        console.log('Email notification failed (non-blocking):', emailError.message);
        // Don't fail the task update if email fails
      }
    }
    
    // Broadcast real-time update if service is available and status changed
    if (taskUpdateServiceInstance && previousStatus !== task.status) {
      try {
        await taskUpdateServiceInstance.handleTaskUpdate(
          req.params.id,
          { ...task.toObject(), previousStatus },
          req.user.id
        );
      } catch (socketError) {
        console.log('Real-time update failed (non-blocking):', socketError.message);
        // Don't fail the task update if real-time update fails
      }
    }

    console.log('Updated task:', task);
    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Broadcast real-time update if service is available
    if (taskUpdateServiceInstance) {
      try {
        await taskUpdateServiceInstance.handleTaskDeleted(req.params.id, req.user.id);
      } catch (socketError) {
        console.log('Real-time update failed (non-blocking):', socketError.message);
        // Don't fail the task deletion if real-time update fails
      }
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};

exports.exportTasksCSV = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).lean();
    if (!tasks.length) return res.status(404).json({ message: 'No tasks found' });
    
    // Transform tasks to include Task ID and format dates
    const transformedTasks = tasks.map(task => ({
      'Task ID': task._id.toString(),
      'Title': task.title,
      'Status': task.status,
      'Created Date': new Date(task.createdAt).toLocaleDateString(),
      'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'
    }));
    
    const fields = ['Task ID', 'Title', 'Status', 'Created Date', 'Due Date'];
    const parser = new Parser({ fields });
    const csv = parser.parse(transformedTasks);
    
    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="tasks-report.csv"');
    return res.send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ message: 'Failed to export tasks', error: err.message });
  }
}; 