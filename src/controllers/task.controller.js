import Task from "../models/task.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import SubTask from "../models/subTask.model.js";
import Comment from "../models/comment.model.js";
import Group from "../models/group.model.js";
import mongoose from 'mongoose';

const createTask = asyncHandler(async (req, res) => {
    const { title, description, dueDate, priority, assignedBy, assignedTo, categoryID } = req.body;

    try {
        const task = Task.create({
            title,
            description,
            dueDate,
            priority,
            assignedBy,
            assignedTo,
            categoryID,
        });

        if (!task) {
            throw new ApiError(404, "Task not found");
        }

        return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
    } catch (error) {
        throw new ApiError(500, "Error in creating new task",);
    }
});

const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { title, description, dueDate, priority,stage } = req.body;

    try {
         const task = await Task.findById(taskId).populate('categoryID');
         if (!task) {
             throw new ApiError(404, "Task not found");
         }
         const { categoryID, assignedTo } = task;
         const groupID = categoryID.groupID;
         if (!groupID) {
             throw new ApiError(400, "Category does not have an associated group");
         }
         const group = await Group.findById(groupID);
         if (!group) {
             throw new ApiError(404, "Group not found");
         }
         const isUserAdmin = group.admin.equals(req.user._id)
         const isUserAssigned = assignedTo.some(user => user.equals(req.user._id));
         if (!isUserAdmin && !isUserAssigned) {
             throw new ApiError(403, "You are not authorized to update this task");
         }
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                title,
                description,
                dueDate,
                priority,
                stage,
            },
            { new: true }
        );

        if (!updatedTask) {
            throw new ApiError(404, "Could not update the task");
        }

        return res.status(200).json(new ApiResponse(200, updatedTask, "Task updated successfully"));
    } catch (error) {
        throw new ApiError(500, "Error in updating the task",);
    }
});

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate('categoryID');
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    const { categoryID, assignedTo } = task;
    const groupID = categoryID.groupID;
    if (!groupID) {
        throw new ApiError(400, "Category does not have an associated group");
    }
    const group = await Group.findById(groupID);
    if (!group) {
        throw new ApiError(404, "Group not found");
    }
    const isUserAdmin = group.admin.equals(req.user._id)
    const isUserAssigned = assignedTo.some(user => user.equals(req.user._id));
    if (!isUserAdmin && !isUserAssigned) {
        throw new ApiError(403, "You are not authorized to delete this task");
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
        return res.status(404).json(new ApiResponse(404, null, "Task not found"));
    }

    return res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
});

const paginateTasks = async (pipeline, page, limit) => {
    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
    };

    return await Task.aggregatePaginate(pipeline, options);
};

const getTasksByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page, limit } = req.query;

    try {
        const pipeline = [
            { $match: { assignedTo: userId } },
            { $sort: { createdAt: -1 } },
        ];

        const result = await paginateTasks(pipeline, page, limit);

        return res.status(200).json(new ApiResponse(200, result, "Tasks fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Error in getTasksByUser");
    }
});

const getTasksByStage = asyncHandler(async (req, res) => {
    const { stage } = req.params;
    const { page, limit } = req.query;
    try {
        const pipeline = [
            { $match: { assignedTo: mongoose.Types.ObjectId(req.user._id) } },
            { $match: { stage } },
            { $sort: { createdAt: -1 } }, 
        ];

        const result = await paginateTasks(pipeline, page, limit);

        return res.status(200).json(new ApiResponse(200, result, "Tasks fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Error in getTasksByStage");
    }
});

const getTasksByDueDate = asyncHandler(async (req, res) => {
    const { dueDate } = req.params;
    const { page, limit } = req.query;
    try {
        const pipeline = [
            { $match: { assignedTo: mongoose.Types.ObjectId(req.user._id) } },
            { $match: { dueDate: { $lte: new Date(dueDate) } } },
            { $sort: { createdAt: -1 } }, 
        ];

        const result = await paginateTasks(pipeline, page, limit);

        return res.status(200).json(new ApiResponse(200, result, "Tasks fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Error in getTasksByDueDate");
    }
});

const getTasksByPriority = asyncHandler(async (req, res) => {
    const { priority } = req.params;
    const { page, limit } = req.query;
    try {
        const pipeline = [
            { $match: { assignedTo: mongoose.Types.ObjectId(req.user._id) } },
            { $match: { priority } },
            { $sort: { createdAt: -1 } }, 
        ];

        const result = await paginateTasks(pipeline, page, limit);

        return res.status(200).json(new ApiResponse(200, result, "Tasks fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Error in getTasksByPriority");
    }
});

const getSubTasksForTask = asyncHandler(async (req, res) => {
    const { taskId } = req.body;
    try {
        const subtasks = await SubTask.find({ parent: taskId });
        if (subtasks.length === 0) {
            return res.status(404).json(new ApiResponse(404, null, "No subtasks found for this task."));
        }
        return res.status(200).json(new ApiResponse(200, subtasks, "Subtasks retrieved successfully."));
    } catch (error) {
        throw new ApiError(500, "Error getting subtasks");
    }
});

const getCommentsForTask = asyncHandler(async (req, res) => {
    const { taskId } = req.body;
    try {
        const comments = await Comment.find({ taskID : taskId });
        if (comments.length === 0) {
            return res.status(404).json(new ApiResponse(404, null, "No comments found for this task."));
        }
        return res.status(200).json(new ApiResponse(200, comments, "Comments retrieved successfully."));
    } catch (error) {
        throw new ApiError(500, "Error getting comments");
    }
});

const addUserToTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params; 
    const { userId } = req.body;  

    try {
        const task = await Task.findById(taskId).populate('categoryID');
        if (!task) {
            throw new ApiError(404, "Task not found");
        }
        const { categoryID } = task;
        const groupID = categoryID.groupID;
        if (!groupID) {
            throw new ApiError(400, "Category does not have an associated group");
        }
        const group = await Group.findById(groupID);
        if (!group) {
            throw new ApiError(404, "Group not found");
        }
        const isUserAdmin = group.admin.equals(req.user._id)
       
        if (!isUserAdmin) {
            throw new ApiError(403, "You are not authorized to add user to this task");
        }
        if (task.assignedTo.includes(mongoose.Types.ObjectId(userId))) {
            throw new ApiError(400, "User is already assigned to this task");
        }
        task.assignedTo.push(mongoose.Types.ObjectId(userId));
        const updatedTask = await task.save();
        return res.status(200).json(new ApiResponse(200, updatedTask, "User added to task successfully"));

    } catch (error) {
        throw new ApiError(500, "Error adding user to task");
    }
});

const removeUserFromTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;  
    const { userId } = req.body;   
    try {
        const task = await Task.findById(taskId).populate('categoryID');
        if (!task) {
            throw new ApiError(404, "Task not found");
        }
        const { categoryID } = task;
        const groupID = categoryID.groupID;
        if (!groupID) {
            throw new ApiError(400, "Category does not have an associated group");
        }
        const group = await Group.findById(groupID);
        if (!group) {
            throw new ApiError(404, "Group not found");
        }
        const isUserAdmin = group.admin.equals(req.user._id)
       
        if (!isUserAdmin) {
            throw new ApiError(403, "You are not authorized to remove user from this task");
        }
        if (!task.assignedTo.includes(mongoose.Types.ObjectId(userId))) {
            throw new ApiError(400, "User is not assigned to this task");
        }
        task.assignedTo = task.assignedTo.filter(user => !user.equals(mongoose.Types.ObjectId(userId)));
        const updatedTask = await task.save();
        return res.status(200).json(new ApiResponse(200, updatedTask, "User removed from task successfully"));

    } catch (error) {
        throw new ApiError(500, "Error removing user from task");
    }
});



export {
    createTask,
    updateTask,
    deleteTask,
    getTasksByUser,
    getTasksByStage,
    getTasksByDueDate,
    getTasksByPriority,
    getSubTasksForTask,
    getCommentsForTask,
    addUserToTask,
    removeUserFromTask
};
