import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import Notification from "../models/notification.model.js"

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      return res.status(404).json(new ApiError(404, null, "Notification not found"));
    }
    return res.status(200).json(new ApiResponse(200, null, "Notification deleted successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, null, "Server error, unable to delete notification"));
  }
});

export { deleteNotification }
