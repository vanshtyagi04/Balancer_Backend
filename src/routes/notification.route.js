import express from 'express';
import { deleteNotification } from '../controllers/notification.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/delete/:notificationId')
    .delete(verifyJWT, deleteNotification);

export default router;
