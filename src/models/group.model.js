import mongoose, { Schema } from "mongoose";
import Category from "./category.model.js";
import Chat from "./chat.model.js";

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
        isPersonal: {
            type: Boolean,
            default: false,
            required: true,
        },
        chat: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            default: null,
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

        const chatData = {
            groupID: doc._id,
            participants: doc.members,
        };
        const newChat = new Chat(chatData);
        await newChat.save();

        await mongoose.model("Group").findByIdAndUpdate(doc._id, { chat: newChat._id });

        next();
    } catch (error) {
        next(error);
    }
});

const Group = mongoose.model("Group", groupSchema);
export default Group;
