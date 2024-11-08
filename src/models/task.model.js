import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const taskSchema = new Schema(
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
        priority: {
            type: String,
            default: "normal",
            enum: {
                values: ["high", "medium", "low"],
                message: '{VALUE} is not a valid priority level',
            },
        },
        stage: {
            type: String,
            default: "pending",
            enum: {
                values: ["pending", "in progress", "completed"],
                message: '{VALUE} is not a valid task stage',
            },
        },
        assets: [{
            type: String,
            validate: {
                validator: function(value) {
                    return value.every(url => /^https?:\/\//.test(url));
                },
                message: 'Assets should be valid URLs.',
            },
        }],
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, 'AssignedBy is required'],
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, 'AssignedTo is required'],
        },
        categoryID: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        
        completedAt: {
            type: Date,
            default: null
        },

        priorNotificationStatus: {
            type: Boolean,
            default: false,
        },

        urgentNotificationStatus: {
            type: Boolean,
            default: false,
        },
        
        dueDateNotificationStatus: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

taskSchema.plugin(mongooseAggregatePaginate)

const Task = mongoose.model("Task", taskSchema);
export default Task;
