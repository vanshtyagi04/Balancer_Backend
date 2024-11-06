import SubTask from '../models/subTask.model.js'; 
import ApiError from '../utils/ApiError.js'; 
import ApiResponse from '../utils/ApiResponse.js'; 

const createSubTask = async (req, res, next) => {
    const { title, description, parent } = req.body;

    if (!title || !description || !parent) {
        return next(new ApiError(400, "Title, description, and parent task are required."));
    }

    const subTaskData = {
        title,
        description,
        parent,
    };

    try {
        const newSubTask = await SubTask.create(subTaskData);
        return res
        .status(201)
        .json(new ApiResponse(201, newSubTask, "Subtask created successfully."));
    } 
    catch (error) {
        return next(new ApiError(500, "Error creating subtask."));
    }
};

const deleteSubTask = async (req, res, next) => {
    const { id } = req.params; 

    try {
        const subTask = await SubTask.findById(id);
        if (!subTask) {
            return next(new ApiError(404, "Subtask not found."));
        }

        await SubTask.findByIdAndDelete(id);
        return res
        .status(200)
        .json(new ApiResponse(200, null, "Subtask deleted successfully."));
    } catch (error) {
        return next(new ApiError(500, "Error deleting subtask."));
    }
};

export { 
    createSubTask, 
    deleteSubTask 
};
