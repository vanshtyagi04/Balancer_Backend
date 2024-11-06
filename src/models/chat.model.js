import mongoose, { Schema } from "mongoose";
import Group from "./group.model.js";

const chatSchema = new Schema(
    {
        groupID: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Group",
            required: [true, 'Group ID is required'], 
        },
        users: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            default: null,
        }],
        latestMessage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,  
    }
);

chatSchema.post('save', async function(next) {
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
