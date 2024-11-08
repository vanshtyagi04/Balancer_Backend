import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
             type: String,
             required: true,
        },
        taskID: {
            type: Schema.Types.ObjectId,
            ref: "Task" 
        },
        userID: {
            type: Schema.Types.ObjectId,
            ref: "User" 
        },
        groupID: {
            type: Schema.Types.ObjectId,
            ref: "Group" 
        },
    },
    {
        timestamps: true
    }
)


const Notification = mongoose.model("Notification", notificationSchema)
export default Notification;