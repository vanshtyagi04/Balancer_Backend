import mongoose, { Schema } from "mongoose";

const subTaskSchema = new Schema(
    {
        title: { 
            type: String, 
            required: [true, 'Title is required'], 
            minlength: [5, 'Title should be at least 5 characters long'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            minlength: [10, 'Description should be at least 10 characters long'],
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: [true, 'Parent task is required'],
        },
    },
    {
        timestamps: true
    }
)


const SubTask = mongoose.model("SubTask", subTaskSchema)
export default SubTask;