import Group from '../models/group.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Chat from '../models/chat.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import Category from '../models/category.model.js';

const createGroup = asyncHandler(async (req, res) => {
    const { name, description, isPersonal } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required.");
    }

    const groupData = {
        name,
        description,
        admin: req.user._id,
        isPersonal: isPersonal || false,
    };

    try {
        const newGroup = await Group.create(groupData);
        return res
        .status(201)
        .json(new ApiResponse(201, newGroup, "Group created successfully."));
    } 
    catch (error) {
        throw new ApiError(500, "Error creating group.");
    }
})

const deleteGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const group = await Group.findById(id);
        if (!group) {
            throw new ApiError(404, "Group not found.");
        }

        await Chat.findByIdAndDelete(group.chat);
        await Group.findByIdAndDelete(id);

        return res
        .status(200)
        .json(new ApiResponse(200, null, "Group deleted successfully."));
    } 
    catch (error) {
        throw new ApiError(500, "Error deleting group.");
    }
})

const addMembers = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { members } = req.body;

    try {
        const group = await Group.findById(id);
        if (!group) {
            throw new ApiError(404, "Group not found.");
        }

        if (group.isPersonal) {
            throw new ApiError(403, "Cannot add members to a personal group.");
        }

        group.members.push(...members);
        await group.save();

        const chat = await Chat.findById(group.chat);
        if (chat) {
            chat.participants.push(...members);
            await chat.save();
        }
        for (let user_id of members) {
            const user = await User.findOne({ _id: user_id });
            if (user) {
                user.groupID.push(group._id);
                await user.save();  
            }
        }

        return res
        .status(200)
        .json(new ApiResponse(200, group, "Members added successfully."));
    } catch (error) {
        throw new ApiError(500, "Error adding members to group.");
    }
})

const removeMembers = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { members } = req.body;

    try {
        const group = await Group.findById(id);
        if (!group) {
            throw new ApiError(404, "Group not found.");
        }

        if (group.isPersonal) {
            throw new ApiError(403, "Cannot remove members from a personal group.");
        }

        group.members = group.members.filter(member => !members.includes(member));
        await group.save();

        const chat = await Chat.findById(group.chat);
        if (chat) {
            chat.users = chat.users.filter(user => !members.includes(user));
            await chat.save();
        }

        for (let user_id of members) {
            const user = await User.findById(user_id);
            if (user) {
                user.groupID = user.groupID.filter(groupId => !groupId.equals(group._id));
                await user.save();
            }
        }
        return res
        .status(200)
        .json(new ApiResponse(200, group, "Members removed successfully."));
    } 
    catch (error) {
        throw new ApiError(500, "Error removing members from group.");
    }
})

const getGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const group = await Group.findById(id).populate('chat').populate('members' , 'username email pic');
        if (!group) {
            throw new ApiError(404, "Group not found.");
        }
        return res
        .status(200)
        .json(new ApiResponse(200,group, "Group information retrieved successfully."));
    } catch (error) {
        throw new ApiError(500, "Error retrieving group information.");
    }
})

const changeAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newAdminId } = req.body;

    try {
        const group = await Group.findById(id);
        if (!group) {
            throw new ApiError(404, "Group not found.");
        }

        if (group.isPersonal) {
            throw new ApiError(403, "Cannot change admin of a personal group");
        }

        if (!group.members.includes(newAdminId)) {
            throw new ApiError(403, "New admin must be a member of the group.");
        }

        group.admin = newAdminId;
        await group.save();

        return res
        .status(200)
        .json(new ApiResponse(200, group, "Admin changed successfully."));
    } 
    catch (error) {
        throw new ApiError(500, "Error changing group admin.");
    }
})

const updateGroupInfo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description , isPersonal } = req.body;

    try {
        const group = await Group.findById(id);
        if (!group) {
            throw new ApiError(404, "Group not found.");
        }

        if (name) group.name = name;
        if (description) group.description = description;
        if(isPersonal) group.isPersonal = isPersonal;

        await group.save();

        return res
        .status(200)
        .json(new ApiResponse(200, group, "Group information updated successfully."));
    } 
    catch (error) {
        throw new ApiError(500, "Error updating group information.");
    }
})

const getCategories = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const group = await Group.findById(id);
        if (!group) {
            throw new ApiError(404, "Group not found.");
        }
        const categories = await Category.find({ groupID: group._id });
        if (categories.length > 0) {
            res.status(200).json(new ApiResponse(200, categories, "Categories belonging to the group."));
        } else {
            res.status(404).json(new ApiResponse(404, categories, "No categories found for this group."));
        }
    } 
    catch (error) {
        throw new ApiError(500, "Error fetching categories.");
    }
});

export { 
    createGroup, 
    deleteGroup, 
    addMembers, 
    removeMembers, 
    getGroup, 
    changeAdmin, 
    updateGroupInfo,
    getCategories 
};
