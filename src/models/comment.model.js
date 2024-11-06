import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        taskID: {
            type: Schema.Types.ObjectId,
            ref: "Task"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)


const Comment = mongoose.model("Comment", commentSchema)
export default Comment;