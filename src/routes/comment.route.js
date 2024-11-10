import express from 'express';
import { createComment, deleteComment } from '../controllers/comment.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/comments', verifyJWT, createComment);
router.delete('/comments/:id', verifyJWT, deleteComment);

export default router;
