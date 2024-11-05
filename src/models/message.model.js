import mongoose, { Schema } from "mongoose";

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
            ref: "User" 
        }],
        status: {
            type: String,
            enum: ['sent', 'delivered', 'seen'],
            default: 'sent',
        },
    },
    {
        timestamps: true,  
    }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
