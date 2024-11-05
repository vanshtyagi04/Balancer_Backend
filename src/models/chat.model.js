import mongoose, { Schema } from "mongoose";
import Group from "./group.model.js";

const chatSchema = new Schema(
    {
        chatName: { 
            type: String, 
            trim: true, 
            required: [true, 'Chat name is required'],
            minlength: [3, 'Chat name should be at least 3 characters long'],
            maxlength: [50, 'Chat name should not be longer than 50 characters'],
        },
        groupID: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Group",
            required: [true, 'Group ID is required'], 
        },
        users: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, 'Users are required in the chat'],
        }],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
    },
    {
        timestamps: true,  
    }
);

chatSchema.pre('save', async function(next) {
    try {
        if (this.isNew) {
            const group = await Group.findById(this.groupID).select('members');
            if (!group) {
                return next(new Error('Group not found'));
            }
            this.users = group.members;
            next();
        } else {
            next();
        }
    } catch (error) {
        next(error);
    }
})

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
