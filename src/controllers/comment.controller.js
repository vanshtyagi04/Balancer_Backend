import Comment from '../models/comment.model.js'; 
import ApiError from '../utils/ApiError.js'; 
import ApiResponse from '../utils/ApiResponse.js'; 

const createComment = async (req, res, next) => {
    const { content, taskID } = req.body;

    if (!content || !taskID) {
        return next(new ApiError(400, "Content and Task ID are required."));
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
        return next(new ApiError(500, "Error creating comment."));
    }
};

const deleteComment = async (req, res, next) => {
    const { id } = req.params; 

    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            return next(new ApiError(404, "Comment not found."));
        }

        if (!comment.owner.equals(req.user._id)) {
            return next(new ApiError(403, "You are not authorized to delete this comment."));
        }

        await Comment.findByIdAndDelete(id);
        return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully."));
    } catch (error) {
        return next(new ApiError(500, "Error deleting comment."));
    }
};

export { 
    createComment, 
    deleteComment 
};
