import Task from "../models/task.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import SubTask from "../models/subTask.model.js";
import Comment from "../models/comment.model.js";

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
    const { title, description, dueDate, priority, assignedBy, assignedTo, categoryID, stage } = req.body;

    try {
        const task = await Task.findByIdAndUpdate(
            taskId,
            {
                title,
                description,
                dueDate,
                priority,
                assignedBy,
                assignedTo,
                categoryID,
                stage,
            },
            { new: true }
        );

        if (!task) {
            throw new ApiError(404, "Task not found");
        }

        return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
    } catch (error) {
        throw new ApiError(500, "Error in updating the task",);
    }
});

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
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



export {
    createTask,
    updateTask,
    deleteTask,
    getTasksByUser,
    getTasksByStage,
    getTasksByDueDate,
    getTasksByPriority,
    getSubTasksForTask,
    getCommentsForTask
};
