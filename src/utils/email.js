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

const sendUpcomingDeadlineReminder = async (taskId) => {
  try {
    const task = await Task.findById(taskId).populate("assignedTo", "email username");
    if (!task) throw new Error("Task not found");

    const { title, dueDate, assignedTo } = task;
    const subject = "Upcoming Deadline Reminder: Your Task is Due Soon";
    const text = `Hello ${assignedTo.username},\n\nThis is a friendly reminder that your task "${title}" is due in the next few days. The task is due by ${dueDate.toDateString}. Please ensure that it's completed on time.\n\nThank you!`;
    const html = `<p>Hello ${assignedTo.username},</p><p>This is a friendly reminder that your task "<strong>${title}</strong>" is due in the next few days. The task is due by <strong>${dueDate.toDateString()}</strong>. Please ensure that it's completed on time.</p><p>Thank you!</p>`;

    await sendEmail(assignedTo.email, subject, text, html);
  } catch (error) {
    console.error("Error sending upcoming deadline reminder:", error);
  }
};

const sendUrgentDeadlineReminder = async (taskId) => {
  try {
    const task = await Task.findById(taskId).populate("assignedTo", "email username");
    if (!task) throw new Error("Task not found");

    const { title, dueDate, assignedTo } = task;
    const subject = "Urgent Deadline Reminder: Your Task is Due Soon!";
    const text = `Hello ${assignedTo.username},\n\nThis is an urgent reminder that your task "${title}" is due within the next 24 hours. The task is due by ${dueDate.toDateString()}. Please prioritize completing it as soon as possible.\n\nThank you!`;
    const html = `<p>Hello ${assignedTo.username},</p><p>This is an urgent reminder that your task "<strong>${title}</strong>" is due within the next 24 hours. The task is due by <strong>${dueDate.toDateString()}</strong>. Please prioritize completing it as soon as possible.</p><p>Thank you!</p>`;

    await sendEmail(assignedTo.email, subject, text, html);
  } catch (error) {
    console.error("Error sending urgent deadline reminder:", error);
  }
};

const sendOverdueTaskReminderMail = async (taskId) => {
  try {
    const task = await Task.findById(taskId).populate("assignedTo", "email username");
    if (!task) throw new Error("Task not found");

    const { title, dueDate, assignedTo } = task;
    const subject = "Overdue Task Reminder: Your Task is Past Due";
    const text = `Hello ${assignedTo.username},\n\nThis is a reminder that your task "${title}" was due on ${dueDate.toDateString()} and has now passed the due date. Please take immediate action and complete the task.\n\nThank you!`;
    const html = `<p>Hello ${assignedTo.username},</p><p>This is a reminder that your task "<strong>${title}</strong>" was due on <strong>${dueDate.toDateString()}</strong> and has now passed the due date. Please take immediate action and complete the task.</p><p>Thank you!</p>`;

    await sendEmail(assignedTo.email, subject, text, html);
  } catch (error) {
    console.error("Error sending overdue task reminder:", error);
  }
};

export {
  sendUpcomingDeadlineReminder,
  sendUrgentDeadlineReminder,
  sendOverdueTaskReminderMail
}
