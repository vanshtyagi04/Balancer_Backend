import mongoose, { Schema } from "mongoose";
import Chat from "./chat.model.js";

const messageSchema = new Schema(
    {
        sender: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, 'Sender is required'],
        },
        content: { 
            type: String, 
            trim: true,
            required: [true, 'Message content is required'], 
            minlength: [1, 'Message content cannot be empty'], 
        },
        chat: { 
            type: Schema.Types.ObjectId, 
            ref: "Chat", 
            required: [true, 'Chat is required'], 
        },
        readBy: [{ 
            type: Schema.Types.ObjectId, 
            ref: "User" 
        }],
        deliveredTo: [{
            type: Schema.Types.ObjectId, 
            ref: "User", 
            default: null,
        }],
    },
    {
        timestamps: true,  
    }
);

messageSchema.post('save', async function(next) {
    try {
        if (this.isNew) {
            const user = await Chat.findById(this.chat).select('users');
            if (!user) {
                return next(new Error('Users not found'));
            }
            this.deliveredTo = user.users;
            next();
        } else {
            next();
        }
    } catch (error) {
        next(error);
    }
})

const Message = mongoose.model("Message", messageSchema);
export default Message;
