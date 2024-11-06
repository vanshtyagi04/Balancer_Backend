import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import Notification from "../models/notification.model.js";

import Notification from "./notification.model.js";
import User from "./user.model.js";
import Group from "./group.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const createNotification = asyncHandler(async (req, res) => {
  const { userId, title, description, taskId, groupId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found", false));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json(new ApiResponse(404, null, "Group not found", false));
  }

  const notificationData = {
    title,
    description,
    task: taskId || null,
    groupName: group.name,
  };

  const notification = await Notification.create(notificationData);

  res.status(201).json(new ApiResponse(201, notification, "Notification created successfully"));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId, userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found", false));
  }

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    return res.status(404).json(new ApiResponse(404, null, "Notification not found", false));
  }

  await notification.remove();

  res.status(200).json(new ApiResponse(200, null, "Notification deleted successfully"));
});

export {
    createNotification, 
    deleteNotification
}
