import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const createMessage = asyncHandler(async (req, res) => {
    const { sender, content, chatId } = req.body;

    if (!sender || !content || !chatId) {
        return res.status(400).json(new ApiResponse(400, null, "Sender, content, and chat ID are required."));
    }

    const newMessage = await Message.create({
        sender,
        content,
        chat: chatId,
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: content });

    res.status(201).json(new ApiResponse(201, newMessage, "Message created successfully."));
});

const markMessageAsRead = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id;  

    const message = await Message.findById(messageId);

    if (!message) {
        return res.status(404).json(new ApiResponse(404, null, "Message not found."));
    }

    if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        await message.save();
    }

    res.status(200).json(new ApiResponse(200, message, "Message marked as read."));
});

export {
    createMessage,
    markMessageAsRead,
}
