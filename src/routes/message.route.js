import express from 'express';
import { createMessage, markMessageAsRead } from '../controllers/message.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/create')
    .post(verifyJWT, createMessage);

router.route('/read/:messageId')
    .put(verifyJWT, markMessageAsRead);

export default router;
