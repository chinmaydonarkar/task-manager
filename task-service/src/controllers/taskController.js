const Task = require('../models/Task');
const path = require('path');
const fs = require('fs');
const emailService = require('../services/emailService');
const { Parser } = require('json2csv');

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
    
    // Send email notification (for demo, use req.user.email or a placeholder)
    try {
      const to = req.user.email || 'demo@email.com';
      await emailService.sendTaskNotification(
        to,
        'Task Created',
        `Your task "${title}" has been created!`,
        `<p>Your task <b>${title}</b> has been created!</p>`
      );
    } catch (emailError) {
      console.log('Email notification failed (non-blocking):', emailError.message);
      // Don't fail the task creation if email fails
    }
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get tasks', error: err.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
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
        const to = req.user.email || 'demo@email.com';
        await emailService.sendTaskNotification(
          to,
          'Task Completed',
          `Your task "${task.title}" is completed!`,
          `<p>Your task <b>${task.title}</b> is completed!</p>`
        );
      } catch (emailError) {
        console.log('Email notification failed (non-blocking):', emailError.message);
        // Don't fail the task update if email fails
      }
    }
    
    console.log('Updated task:', task);
    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};

exports.exportTasksCSV = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).lean();
    if (!tasks.length) return res.status(404).json({ message: 'No tasks found' });
    const fields = ['title', 'description', 'status', 'dueDate', 'createdAt', 'updatedAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(tasks);
    res.header('Content-Type', 'text/csv');
    res.attachment('tasks.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Failed to export tasks', error: err.message });
  }
}; 