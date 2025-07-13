const transporter = require('../config/mailer');
require('dotenv').config();

// Email templates
const createTaskCreatedTemplate = (userName, taskTitle, taskDescription, dueDate) => ({
  subject: `Task Created: ${taskTitle}`,
  text: `Hello ${userName},\n\nYour task "${taskTitle}" has been successfully created!\n\nDescription: ${taskDescription || 'No description provided'}\nDue Date: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date set'}\n\nYou can view and manage your tasks in your dashboard.\n\nBest regards,\nIndiaNIC Task Manager`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Task Created Successfully!</h1>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 10px 0;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #374151; font-size: 16px; margin: 0;">Your task has been successfully created and is now ready for you to work on.</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Task Details</h3>
          <p style="color: #374151; margin: 0 0 10px 0;"><strong>Title:</strong> ${taskTitle}</p>
          <p style="color: #374151; margin: 0 0 10px 0;"><strong>Description:</strong> ${taskDescription || 'No description provided'}</p>
          <p style="color: #374151; margin: 0;"><strong>Due Date:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date set'}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">You can view and manage your tasks in your dashboard.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Best regards,<br>IndiaNIC Task Manager</p>
        </div>
      </div>
    </div>
  `
});

const createTaskCompletedTemplate = (userName, taskTitle, taskDescription) => ({
  subject: `Task Completed: ${taskTitle}`,
  text: `Hello ${userName},\n\nCongratulations! Your task "${taskTitle}" has been marked as completed!\n\nDescription: ${taskDescription || 'No description provided'}\n\nGreat job on completing this task!\n\nBest regards,\nIndiaNIC Task Manager`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0; font-size: 24px;">🎉 Task Completed!</h1>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 10px 0;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #374151; font-size: 16px; margin: 0;">Congratulations! You've successfully completed your task.</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Completed Task</h3>
          <p style="color: #374151; margin: 0 0 10px 0;"><strong>Title:</strong> ${taskTitle}</p>
          <p style="color: #374151; margin: 0;"><strong>Description:</strong> ${taskDescription || 'No description provided'}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">Great job on completing this task!</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">Best regards,<br>IndiaNIC Task Manager</p>
        </div>
      </div>
    </div>
  `
});

exports.sendTaskNotification = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
      html
    });
    console.log(`Email notification sent successfully to ${to}`);
  } catch (error) {
    console.error('Email notification failed:', error);
    throw error;
  }
};

exports.sendTaskCreatedNotification = async (userEmail, userName, taskData) => {
  try {
    const template = createTaskCreatedTemplate(
      userName,
      taskData.title,
      taskData.description,
      taskData.dueDate
    );
    
    await this.sendTaskNotification(
      userEmail,
      template.subject,
      template.text,
      template.html
    );
  } catch (error) {
    console.error('Task creation email notification failed:', error);
    // Don't throw error to avoid failing the task creation
  }
};

exports.sendTaskCompletedNotification = async (userEmail, userName, taskData) => {
  try {
    const template = createTaskCompletedTemplate(
      userName,
      taskData.title,
      taskData.description
    );
    
    await this.sendTaskNotification(
      userEmail,
      template.subject,
      template.text,
      template.html
    );
  } catch (error) {
    console.error('Task completion email notification failed:', error);
    // Don't throw error to avoid failing the task update
  }
}; 