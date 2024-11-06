import Task from "../models/task.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";

const createTask = asyncHandler(async (req, res) => {
    const { title, description, dueDate, priority, assignedBy, assignedTo, categoryID } = req.body;

    try {
        const task = new Task({
            title,
            description,
            dueDate,
            priority,
            assignedBy,
            assignedTo,
            categoryID,
        });

        await task.save();

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

        return res.status(200).json(new ApiResponse(200, result.tasks, "Tasks fetched successfully"));
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

        return res.status(200).json(new ApiResponse(200, result.tasks, "Tasks fetched successfully"));
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

        return res.status(200).json(new ApiResponse(200, result.tasks, "Tasks fetched successfully"));
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

        return res.status(200).json(new ApiResponse(200, result.tasks, "Tasks fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Error in getTasksByPriority");
    }
});

export {
    createTask,
    updateTask,
    deleteTask,
    getTasksByUser,
    getTasksByStage,
    getTasksByDueDate,
    getTasksByPriority
};
