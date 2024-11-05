import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
       
    },
    {
        timestamps: true
    }
)


const Notification = mongoose.model("Notification", notificationSchema)
export default Notification;