import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import User from "../models/user.model.js"
import {uploadOnCloudinary, deleteCloudinary} from "../utils/cloudinary.js"
import ApiResponse  from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import Notification from "../models/notification.model.js"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken() 
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler( async (req, res) => {

    const { email, username, password} = req.body

    if(
        [ email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const picLocalPath = req.files?.pic[0]?.path

    if(!picLocalPath) {
        throw new ApiError(400, "pic file is required")
    }

    const pic = await uploadOnCloudinary(picLocalPath)

    if(!pic) {
        throw new ApiError(400, "pic file is required")
    }

    const user = await User.create({
         
        pic: pic.url, 
        email, 
        password, 
        username: username.toLowerCase(), 
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async(req, res) => {

    const {email, username, password} = req.body

    if(!(username || email)) {
        throw new ApiError(400, "Username or email required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken").populate(groupID);

    const options = {
        httpOnly: true, 
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            }, 
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        }
    )

    const options = {
        httpOnly: true, 
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true, 
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    accessToken, refreshToken: newRefreshToken
                }, 
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword
    await user.save()

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {username , email} = req.body

    if(!email || !username) {
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set: {
                 
                email, 
                username
            }
        }, 
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserPic = asyncHandler(async (req, res) => {
    const picLocalPath = req.file?.path;

    if (!picLocalPath) {
        throw new ApiError(400, "pic file is missing");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const oldPicUrl = user.pic;
    const oldPublicId = oldPicUrl ? oldPicUrl.split('/').pop().split('.')[0] : null;

    const pic = await uploadOnCloudinary(picLocalPath);
    if (!pic.url) {
        throw new ApiError(400, "Error while uploading pic");
    }

    if (oldPublicId) {
        await deleteCloudinary(oldPublicId);
    }

    user.pic = pic.url;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, user.select("-password"), "pic image updated successfully")
    );
});

const findUsersByName = asyncHandler(async (req, res) => {
    const { name } = req.body;

    try {
        const users = await User.find({ username: { $regex: name, $options: 'i' } }).select("-password -refreshToken");
        if (users.length !== 0) {
            res.status(200)
               .json(new ApiResponse(200, users, "Users by name"));
        } else {
            res.status(404)
               .json(new ApiResponse(404, users, "No user found"));
        }
    } catch (err) {
        throw new ApiError(500, "Server side error in findUsersByName");
    }
});

const getNotifications = asyncHandler(async(req , res) => {
    const { userId } = req.body;
    try {
        const notifications = await Notification.find({ userID : userId })
        .populate({ path: 'groupID', select: 'name' }) 
        .populate({ path: 'taskID', select: 'title' });
        if (notifications.length === 0) {
            return res.status(404).json(new ApiResponse(404, null, "No notifications found for this task."));
        }
        return res.status(200).json(new ApiResponse(200, comments, "Notifiactions retrieved successfully."));
    } catch (error) {
        throw new ApiError(500, "Error getting notifiactions");
    }
})

export {
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
}