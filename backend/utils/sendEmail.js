const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (emailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  try {
    await transporter.sendMail(emailOptions);
    console.log('Email sent:', emailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
