import Task from "../models/task.model.js";
import { sendUpcomingDeadlineReminder , sendUrgentDeadlineReminder , sendOverdueTaskReminderMail } from "./email.js";

const sendRemindersForUpcomingDeadlines = async () => {
    try {
      const now = new Date();
      const reminderThreshold = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const tasks = await Task.find({
        dueDate: { $lte: reminderThreshold, $gt: now },
        stage: { $ne: "completed" },
        priorNotificationStatus: { $ne: true },
        urgentNotificationStatus: { $ne: true },
        createdAt: { $lte: fiveDaysAgo }
      }).populate("assignedTo", "email username");
  
      if (tasks.length === 0) {
        console.log("No tasks due soon.");
        return;
      }
  
      await Task.updateMany(
        { _id: { $in: tasks.map(task => task._id) } },
        { $set: { priorNotificationStatus: true } }
      );
  
      for (const task of tasks) {
        await sendUpcomingDeadlineReminder(task._id);
      }
  
      console.log(`${tasks.length} reminder(s) sent.`);
    } catch (error) {
      console.error("Error scanning tasks for reminders:", error);
    }
  };
  
  const sendRemindersForUrgentDeadlines = async () => {
    try {
      const now = new Date();
      const reminderThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tasks = await Task.find({
        dueDate: { $lte: reminderThreshold, $gt: now },
        stage: { $ne: "completed" },
        priorNotificationStatus: { $ne: false },
        urgentNotificationStatus: { $ne: true },
        createdAt: { $lte: oneDayAgo }
      }).populate("assignedTo", "email username");
  
      if (tasks.length === 0) {
        console.log("No urgent tasks due soon.");
        return;
      }
  
      await Task.updateMany(
        { _id: { $in: tasks.map(task => task._id) } },
        { $set: { priorNotificationStatus: true } },
        { $set: { urgentNotificationStatus: true } }
      );
  
      for (const task of tasks) {
        await sendUrgentDeadlineReminder(task._id);
      }
  
      console.log(`${tasks.length} reminder(s) sent.`);
    } catch (error) {
      console.error("Error scanning tasks for reminders:", error);
    }
  };
  
  const sendOverdueTaskReminder = async () => {
    try {
      const now = new Date();
      const tasks = await Task.find({
        dueDate: { $lt: now },
        stage: { $ne: "completed" },
        dueDateNotificationStatus: { $ne: true },
      }).populate("assignedTo", "email username");
  
      if (tasks.length === 0) {
        console.log("No overdue tasks.");
        return;
      }
  
      await Task.updateMany(
        { _id: { $in: tasks.map(task => task._id) } },
        { $set: { dueDateNotificationStatus: true } }
      );
  
      for (const task of tasks) {
        await sendOverdueTaskReminderMail(task._id);
      }
  
      console.log(`${tasks.length} overdue task reminder(s) sent.`);
    } catch (error) {
      console.error("Error sending overdue task reminders:", error);
    }
  };
  
  const startTaskReminder = async () => {
    try {
      await sendOverdueTaskReminder();
      await sendRemindersForUpcomingDeadlines();
      await sendRemindersForUrgentDeadlines();
  
      setInterval(async () => {
        await sendOverdueTaskReminder();
        await sendRemindersForUpcomingDeadlines();
        await sendRemindersForUrgentDeadlines();
      }, 60 * 60 * 1000);
    } catch (error) {
      console.error("Error starting task reminders:", error);
    }
  };
  
  export default startTaskReminder;
  