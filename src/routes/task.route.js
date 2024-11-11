import express from 'express';
import { 
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
} from '../controllers/task.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/create')
    .post(verifyJWT, createTask);

router.route('/update/:taskId')
    .put(verifyJWT, updateTask);

router.route('/delete/:taskId')
    .delete(verifyJWT, deleteTask);

router.route('/user/:userId')
    .get(verifyJWT, getTasksByUser);

router.route('/stage/:stage')
    .get(verifyJWT, getTasksByStage);

router.route('/due-date/:dueDate')
    .get(verifyJWT, getTasksByDueDate);

router.route('/priority/:priority')
    .get(verifyJWT, getTasksByPriority);

router.route('/subtasks')
    .post(verifyJWT, getSubTasksForTask);

router.route('/comments')
    .post(verifyJWT, getCommentsForTask);

router.route('/add-user/:taskId')
    .put(verifyJWT, addUserToTask);

router.route('/remove-user/:taskId')
    .put(verifyJWT, removeUserFromTask);

export default router;
