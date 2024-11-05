import Category from '../models/category.model.js';
import Task from '../models/task.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

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


const getCategory = async (req, res) => {
    const { categoryId } = req.params; 
    const { page = 1, limit = 10 } = req.query; 

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        
        const taskAggregation = Task.aggregate([
            {
                $match: {
                    categoryID: mongoose.Types.ObjectId(categoryId) 
                }
            },
            {
                $lookup: {
                    from: 'users', 
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedToUser'
                }
            },
            {
                $unwind: {
                    path: "$assignedToUser",
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    priority: 1,
                    assignedTo: {
                        _id: "$assignedToUser._id",
                        username: "$assignedToUser.username",
                        email: "$assignedToUser.email",
                        pic: "$assignedToUser.pic"
                    },
                    completedAt: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
        };

        const result = await Task.aggregatePaginate(taskAggregation, options);
        res.status(200).json({
            success: true,
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
            },
            tasks: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTasksByPriority = async (req, res) => {
    const { categoryId } = req.params;
    const { priority } = req.query;
    const { page = 1, limit = 10 } = req.query;

    try {
        const validPriorities = ["high", "medium", "low"];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority value. Valid options are: high, medium, low.' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const taskAggregation = Task.aggregate([
            {
                $match: {
                    categoryID: mongoose.Types.ObjectId(categoryId),
                    priority: priority
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedToUser'
                }
            },
            {
                $unwind: {
                    path: "$assignedToUser",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    priority: 1,
                    assignedTo: {
                        _id: "$assignedToUser._id",
                        username: "$assignedToUser.username",
                        email: "$assignedToUser.email",
                        pic: "$assignedToUser.pic"
                    },
                    completedAt: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
        };

        const result = await Task.aggregatePaginate(taskAggregation, options);

        res.status(200).json({
            success: true,
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
            },
            tasks: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTasksByStage = async (req, res) => {
    const { categoryId } = req.params;
    const { stage } = req.query;
    const { page = 1, limit = 10 } = req.query;

    try {
        const validStages = ["pending", "in progress", "completed"];
        if (!validStages.includes(stage)) {
            return res.status(400).json({ message: 'Invalid stage value. Valid options are: pending, in progress, completed.' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const taskAggregation = Task.aggregate([
            {
                $match: {
                    categoryID: mongoose.Types.ObjectId(categoryId),
                    stage: stage
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedToUser'
                }
            },
            {
                $unwind: {
                    path: "$assignedToUser",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    priority: 1,
                    assignedTo: {
                        _id: "$assignedToUser._id",
                        username: "$assignedToUser.username",
                        email: "$assignedToUser.email",
                        pic: "$assignedToUser.pic"
                    },
                    completedAt: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
        };

        const result = await Task.aggregatePaginate(taskAggregation, options);

        res.status(200).json({
            success: true,
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
            },
            tasks: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTasksByDueDate = async (req, res) => {
    const { categoryId } = req.params;
    const { order } = req.body; 
    const { page = 1, limit = 10 } = req.query;

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const taskAggregation = Task.aggregate([
            {
                $match: {
                    categoryID: mongoose.Types.ObjectId(categoryId)
                }
            },
            {
                $sort: {
                    dueDate: order === 'asc' ? 1 : -1
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedToUser'
                }
            },
            {
                $unwind: {
                    path: "$assignedToUser",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    priority: 1,
                    assignedTo: {
                        _id: "$assignedToUser._id",
                        username: "$assignedToUser.username",
                        email: "$assignedToUser.email",
                        pic: "$assignedToUser.pic"
                    },
                    completedAt: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
        };

        const result = await Task.aggregatePaginate(taskAggregation, options);

        res.status(200).json({
            success: true,
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
            },
            tasks: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTasksByAssignedTo = async (req, res) => {
    const { categoryId } = req.params;
    const { assignedTo } = req.query;
    const { page = 1, limit = 10 } = req.query;

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const taskAggregation = Task.aggregate([
            {
                $match: {
                    categoryID: mongoose.Types.ObjectId(categoryId),
                    assignedTo: mongoose.Types.ObjectId(assignedTo)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedToUser'
                }
            },
            {
                $unwind: {
                    path: "$assignedToUser",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    priority: 1,
                    assignedTo: {
                        _id: "$assignedToUser._id",
                        username: "$assignedToUser.username",
                        email: "$assignedToUser.email",
                        pic: "$assignedToUser.pic"
                    },
                    completedAt: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
        };

        const result = await Task.aggregatePaginate(taskAggregation, options);

        res.status(200).json({
            success: true,
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
            },
            tasks: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { 
    createCategory, 
    deleteCategory, 
    updateCategory,
    getCategory,
    getTasksByStage,
    getTasksByDueDate,
    getTasksByAssignedTo,
    getTasksByPriority, 
};
