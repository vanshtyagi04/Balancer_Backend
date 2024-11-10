import express from 'express';
import { createSubTask, deleteSubTask } from '../controllers/subTask.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/create')
    .post(verifyJWT, createSubTask);

router.route('/delete/:id')
    .delete(verifyJWT, deleteSubTask);

export default router;
