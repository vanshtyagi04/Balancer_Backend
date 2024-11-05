import Category from '../models/category.model.js';
import Task from '../models/task.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const createCategory = async (req, res, next) => {
    const { name, description, groupID } = req.body;

    if (!name || !description || !groupID) {
        return next(new ApiError(400, "Name, description, and groupID are required."));
    }

    try {
        const newCategory = await Category.create({ name, description, groupID });
        return res
        .status(201)
        .json(new ApiResponse(201, newCategory, "Category created successfully."));
    } 
    catch (error) {
        return next(new ApiError(500, "Error creating category."));
    }
};

const deleteCategory = async (req, res, next) => {
    const { id } = req.params;

    try {
        const category = await Category.findById(id);
        if (!category) {
            return next(new ApiError(404, "Category not found."));
        }

        await Task.updateMany({ categoryID: id }, { $unset: { categoryID: "" } });

        await Category.findByIdAndDelete(id);
        return res
        .status(200)
        .json(new ApiResponse(200, null, "Category deleted successfully."));
    } 
    catch (error) {
        return next(new ApiError(500, "Error deleting category."));
    }
};

const updateCategory = async (req, res, next) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const category = await Category.findById(id);
        if (!category) {
            return next(new ApiError(404, "Category not found."));
        }

        if (name) category.name = name;
        if (description) category.description = description;

        await category.save();

        await Task.updateMany({ categoryID: id }, { $set: { categoryID: id } });

        return res
        .status(200)
        .json(new ApiResponse(200, category, "Category updated successfully."));
    } 
    catch (error) {
        return next(new ApiError(500, "Error updating category."));
    }
};

export { 
    createCategory, 
    deleteCategory, 
    updateCategory 
};
