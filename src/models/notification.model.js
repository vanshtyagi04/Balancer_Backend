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
        task: {
            type: Schema.Types.ObjectId,
            ref: "Task" 
        },
        groupName: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)


const Notification = mongoose.model("Notification", notificationSchema)
export default Notification;