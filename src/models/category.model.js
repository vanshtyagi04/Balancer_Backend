import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: { 
            type: String, 
            required: [true, 'Title is required'], 
            minlength: [5, 'Title should be at least 5 characters long'],
            required: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            minlength: [10, 'Description should be at least 10 characters long'],
            required: true,
        },
        groupID: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
    },
    {
        timestamps: true
    }
)

const Category = mongoose.model("Category", categorySchema)
export default Category;