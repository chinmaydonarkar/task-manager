const cron = require('node-cron');
const Task = require('../models/Task');
const emailService = require('../services/emailService');
const mongoose = require('mongoose');
require('dotenv').config();

// For demo, use a test user
const DEMO_USER_EMAIL = 'demo@email.com';

const sendReminders = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const tasks = await Task.find({
    dueDate: { $gte: today, $lt: tomorrow },
    status: { $in: ['pending', 'in_progress'] }
  });

  if (tasks.length) {
    const taskList = tasks.map(t => `<li>${t.title} (due: ${t.dueDate.toDateString()})</li>`).join('');
    await emailService.sendTaskNotification(
      DEMO_USER_EMAIL,
      'Task Reminder',
      `You have ${tasks.length} tasks due today!`,
      `<p>You have the following tasks due today:</p><ul>${taskList}</ul>`
    );
    console.log('Task reminder email sent');
  }
};

// Schedule at 8AM every day
cron.schedule('0 8 * * *', sendReminders);

module.exports = cron; 