import express from 'express';
import {
    createGroup,
    deleteGroup,
    addMembers,
    removeMembers,
    getGroup,
    changeAdmin,
    updateGroupInfo,
    getCategories
} from '../controllers/group.controller.js';
import  verifyJWT  from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/groups', verifyJWT, createGroup);
router.delete('/groups/:id', verifyJWT, deleteGroup);
router.put('/groups/:id/add-members', verifyJWT, addMembers);
router.put('/groups/:id/remove-members', verifyJWT, removeMembers);
router.get('/groups/:id', verifyJWT, getGroup);
router.put('/groups/:id/change-admin', verifyJWT, changeAdmin);
router.put('/groups/:id', verifyJWT, updateGroupInfo);
router.get('/groups/:id/categories', verifyJWT, getCategories);

export default router;
