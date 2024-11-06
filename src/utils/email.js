import nodemailer from "nodemailer";
import Task from "./task.model.js";

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

export const sendDeadlineReminder = async (taskId) => {
  try {
    const task = await Task.findById(taskId).populate("assignedTo", "email username");
    if (!task) throw new Error("Task not found");

    const { title, dueDate, assignedTo } = task;
    const subject = "To-Do Deadline Reminder";
    const text = `Hello ${assignedTo.username},\n\nYour task "${title}" is due by ${dueDate.toDateString()}. Please take necessary action.`;
    const html = `<p>Hello ${assignedTo.username},</p><p>Your task "<strong>${title}</strong>" is due by <strong>${dueDate.toDateString()}</strong>. Please take necessary action.</p>`;

    await sendEmail(assignedTo.email, subject, text, html);
  } catch (error) {
    console.error("Error sending deadline reminder:", error);
  }
};

