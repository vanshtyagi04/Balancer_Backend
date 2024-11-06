import Comment from '../models/comment.model.js'; 
import ApiError from '../utils/ApiError.js'; 
import ApiResponse from '../utils/ApiResponse.js'; 
import { asyncHandler } from '../utils/asyncHandler.js';

const createComment = asyncHandler(async (req, res) => {
    const { content, taskID } = req.body;

    if (!content || !taskID) {
        throw new ApiError(400, "Content and Task ID are required.");
    }

    const commentData = {
        content,
        taskID,
        owner: req.user._id 
    };

    try {
        const newComment = await Comment.create(commentData);
        return res.status(201).json(new ApiResponse(201, newComment, "Comment created successfully."));
    } catch (error) {
        throw new ApiError(500, "Error creating comment.");
    }
})
const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params; 

    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            throw new ApiError(404, "Comment not found.");
        }

        if (!comment.owner.equals(req.user._id)) {
            throw new ApiError(403, "You are not authorized to delete this comment.");
        }

        await Comment.findByIdAndDelete(id);
        return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully."));
    } catch (error) {
        throw new ApiError(500, "Error deleting comment.");
    }
})

export { 
    createComment, 
    deleteComment 
};
