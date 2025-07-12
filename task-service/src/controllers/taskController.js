const Task = require('../models/Task');
const path = require('path');
const fs = require('fs');
const emailService = require('../services/emailService');
const { Parser } = require('json2csv');
const { emitTaskCreated, emitTaskUpdated } = require('../sockets/socket');

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    let files = [];
    if (req.files && req.files.length > 0) {
      const uploadDir = path.join(__dirname, '../../uploads/tasks');
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
          url: `/uploads/tasks/${filename}`
        };
      }));
    }
    const task = await Task.create({
      title,
      description,
      dueDate,
      files,
      user: req.user.id
    });
    // Send email notification (for demo, use req.user.email or a placeholder)
    const to = req.user.email || 'demo@email.com';
    await emailService.sendTaskNotification(
      to,
      'Task Created',
      `Your task "${title}" has been created!`,
      `<p>Your task <b>${title}</b> has been created!</p>`
    );
    emitTaskCreated(task);
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
    const { title, description, status, dueDate } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, description, status, dueDate },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // Send email if status changed to completed
    if (status === 'completed') {
      const to = req.user.email || 'demo@email.com';
      await emailService.sendTaskNotification(
        to,
        'Task Completed',
        `Your task "${task.title}" is completed!`,
        `<p>Your task <b>${task.title}</b> is completed!</p>`
      );
    }
    emitTaskUpdated(task);
    res.json(task);
  } catch (err) {
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