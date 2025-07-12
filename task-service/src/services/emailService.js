const transporter = require('../config/mailer');
require('dotenv').config();

exports.sendTaskNotification = async (to, subject, text, html) => {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text,
    html
  });
}; 