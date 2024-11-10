import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserPic,
    findUsersByName,
    getNotifications
} from '../controllers/user.controller.js';
import   verifyJWT  from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/register')
    .post(
        upload.fields([
            {
                name: "pic", 
                maxCount: 1
            }
        ]), registerUser
    );

router.route('/login')
    .post(loginUser);

router.route('/logout')
    .post(verifyJWT, logoutUser);

router.route('/refresh-token')
    .post(refreshAccessToken);

router.route('/change-password')
    .post(verifyJWT, changeCurrentPassword);

router.route('/current-user')
    .get(verifyJWT, getCurrentUser);

router.route('/update-account')
    .patch(verifyJWT, updateAccountDetails);

router.route('/update-pic')
    .patch(verifyJWT, upload.single('pic'), updateUserPic);

router.route('/find-users')
    .post(verifyJWT, findUsersByName);

router.route('/notifications')
    .get(verifyJWT, getNotifications);

export default router;
