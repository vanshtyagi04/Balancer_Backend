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
        dueDate: { 
            type: Date, 
            default: new Date(),
            validate: {
                validator: function(value) {
                    return value > Date.now();
                },
                message: 'Due date must be in the future.',
            },
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: [true, 'Parent task is required'],
        },
        stage: {
            type: String,
            default: "pending",
            enum: {
                values: ["pending", "in progress", "completed"],
                message: '{VALUE} is not a valid task stage',
            },
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        completedAt: {
            type: Date,
            default: null
        },
    },
    {
        timestamps: true
    }
)


const SubTask = mongoose.model("SubTask", subTaskSchema)
export default SubTask;