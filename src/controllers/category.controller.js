import Category from '../models/category.model.js';
import Task from '../models/task.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import Group from  "../models/group.model.js"

const createCategory = asyncHandler(async (req, res) => {
    const { name, description, groupID } = req.body;

    if (!name || !description || !groupID) {
        throw new ApiError(400, "Name, description, and groupID are required.");
    }

    try {
        const group = await Group.findById(groupID);
        if (!group) {
            throw new ApiError(404, "Group not found.");
        }
        if (!group.admin.equals(req.user._id)) {
            throw new ApiError(403, "You must be an admin to create a category.");
        }
        const newCategory = await Category.create({ name, description, groupID });
        return res
        .status(201)
        .json(new ApiResponse(201, newCategory, "Category created successfully."));
    } 
    catch (error) {
        throw new ApiError(500, "Error creating category.");
    }
})

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { groupID } = req.body;

    try {
        const group = await Group.findById(groupID);
        if (!group) {
            throw new ApiError(404, "Group not found.");
        }
        if (!group.admin.equals(req.user._id)) {
            throw new ApiError(403, "You must be an admin to delete a category.");
        }
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, "Category not found.");
        }

        await Task.updateMany({ categoryID: id }, { $unset: { categoryID: null } });

        await Category.findByIdAndDelete(id);
        return res
        .status(200)
        .json(new ApiResponse(200, null, "Category deleted successfully."));
    } 
    catch (error) {
        throw new ApiError(500, "Error deleting category.");
    }
})

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description , groupID } = req.body;

    try {
        const group = await Group.findById(groupID);
        if (!group) {
            throw new ApiError(404, "Group not found.");
        }
        if (!group.admin.equals(req.user._id)) {
            throw new ApiError(403, "You must be an admin to update a category.");
        }
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, "Category not found.");
        }

        if (name) category.name = name;
        if (description) category.description = description;

        await category.save();
        return res
        .status(200)
        .json(new ApiResponse(200, category, "Category updated successfully."));
    } 
    catch (error) {
        throw new ApiError(500, "Error updating category.");
    }
})

const getCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ApiError(404, "Category not found");
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
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    priority: 1,
                    assignedTo: {
                        $map: {
                            input: '$assignedToUser',
                            as: 'user',
                            in: {
                                _id: '$$user._id',
                                username: '$$user.username',
                                email: '$$user.email',
                                pic: '$$user.pic'
                            }
                        }
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

        const response = new ApiResponse(200, {
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
                group: category.groupID,
            },
            tasks: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
        });

        res.status(response.statusCode).json(response);

    } catch (error) {
        throw new ApiError(500, "Server error in getCategory");
    }
})

const getTasksByPriority = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { priority } = req.query;
    const { page = 1, limit = 10 } = req.query;

    try {
        const validPriorities = ["high", "medium", "low"];
        if (!validPriorities.includes(priority)) {
            throw new ApiError(400, "Invalid priority value. Valid options are: high, medium, low.");
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ApiError(404, "Category not found");
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
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    priority: 1,
                    assignedTo: {
                        $map: {
                            input: '$assignedToUser',
                            as: 'user',
                            in: {
                                _id: '$$user._id',
                                username: '$$user.username',
                                email: '$$user.email',
                                pic: '$$user.pic'
                            }
                        }
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

        const response = new ApiResponse(200, {
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
            },
            tasks: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
        });

        res.status(response.statusCode).json(response);
    } catch (error) {
        throw new ApiError(500, "Server error in getTasksByPriority");
    }
})

const getTasksByStage = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { stage } = req.query;
    const { page = 1, limit = 10 } = req.query;

    try {
        const validStages = ["pending", "in progress", "completed"];
        if (!validStages.includes(stage)) {
            throw new ApiError(400, "Invalid stage value. Valid options are: pending, in progress, completed.");
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ApiError(404, "Category not found");
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
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    priority: 1,
                    assignedTo: {
                        $map: {
                            input: '$assignedToUser',
                            as: 'user',
                            in: {
                                _id: '$$user._id',
                                username: '$$user.username',
                                email: '$$user.email',
                                pic: '$$user.pic'
                            }
                        }
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

        const response = new ApiResponse(200, {
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
            },
            tasks: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
        });

        res.status(response.statusCode).json(response);
    } catch (error) {
        throw new ApiError(500, "Server error in getTasksByStage");
    }
})

const getTasksByDueDate = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { order } = req.body;
    const { page = 1, limit = 10 } = req.query;

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ApiError(404, "Category not found");
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
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    priority: 1,
                    assignedTo: {
                        $map: {
                            input: '$assignedToUser',
                            as: 'user',
                            in: {
                                _id: '$$user._id',
                                username: '$$user.username',
                                email: '$$user.email',
                                pic: '$$user.pic'
                            }
                        }
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

        const response = new ApiResponse(200, {
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
            },
            tasks: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
        });

        res.status(response.statusCode).json(response);
    } catch (error) {
        throw new ApiError(500, "Server error in getTasksByDueDate");
    }
})

const getTasksByAssignedTo = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { assignedTo } = req.query;
    const { page = 1, limit = 10 } = req.query;

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ApiError(404, "Category not found");
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
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    priority: 1,
                    assignedTo: {
                        $map: {
                            input: '$assignedToUser',
                            as: 'user',
                            in: {
                                _id: '$$user._id',
                                username: '$$user.username',
                                email: '$$user.email',
                                pic: '$$user.pic'
                            }
                        }
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

        const response = new ApiResponse(200, {
            category: {
                id: category._id,
                name: category.name,
                description: category.description,
            },
            tasks: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
        });

        res.status(response.statusCode).json(response);
    }  catch (error) {
        throw new ApiError(500, "Server error in getTasksByAssignedTo");
    }
})

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
