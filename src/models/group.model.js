import mongoose, { Schema } from "mongoose";
import Category from "./category.model.js";

const groupSchema = new Schema(
    {
        name: { 
            type: String, 
            required: [true, 'Name is required'], 
            minlength: [5, 'Name should be at least 5 characters long'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            minlength: [10, 'Description should be at least 10 characters long'],
        },
        admin: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, 'Admin is required'],
        },
        members: [{
            type: Schema.Types.ObjectId,
            ref: "User",
            validate: {
                validator: function(members) {
                    return members.includes(this.admin);
                },
                message: 'Admin must be included in the members list.',
            },
        }],
        chat: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
        }
    },
    {
        timestamps: true,
    }
);

groupSchema.pre('save', function(next) {
    if (this.members && !this.members.includes(this.admin)) {
        this.members.push(this.admin);
    }
    next();
});

groupSchema.post('save', async function(doc, next) {
    try {
        const categoryData = {
            name: "Isolated Task", 
            description: "This is a category for isolated tasks.", 
            groupID: doc._id, 
        };
        const newCategory = new Category(categoryData);
        await newCategory.save(); 

        next();
    } catch (error) {
        next(error);
    }
});

const Group = mongoose.model("Group", groupSchema);
export default Group;
