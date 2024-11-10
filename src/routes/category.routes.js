import express from 'express';
import {
    createCategory,
    deleteCategory,
    updateCategory,
    getCategory,
    getTasksByPriority,
    getTasksByStage,
    getTasksByDueDate,
    getTasksByAssignedTo
} from '../controllers/category.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/categories', verifyJWT, createCategory);
router.delete('/categories/:id', verifyJWT, deleteCategory);
router.put('/categories/:id', verifyJWT, updateCategory);
router.get('/categories/:categoryId', verifyJWT, getCategory);
router.get('/categories/:categoryId/tasks/priority', verifyJWT, getTasksByPriority);
router.get('/categories/:categoryId/tasks/stage', verifyJWT, getTasksByStage);
router.get('/categories/:categoryId/tasks/dueDate', verifyJWT, getTasksByDueDate);
router.get('/categories/:categoryId/tasks/assignedTo', verifyJWT, getTasksByAssignedTo);

export default router;
