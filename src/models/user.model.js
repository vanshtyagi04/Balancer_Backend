import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import Group from "./group.model.js";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
        },
        pic: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        groupID: [{
            type: Schema.Types.ObjectId,
            ref: "Group",
            default: null,
        }],
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.post("save", async function (next) {
    if (this.isNew) { 
        try {
                const groupData = {
                name: "Personal Space",
                description: `This is ${this.username}'s personal group.`,
                admin: this._id,
                members: [this._id], 
                isPersonal: true,
                chat: null, 
            };
            const savedGroup = await Group.create(groupData);
            this.groupID.push(savedGroup._id);
            next();  
        } catch (error) {
            next(error);  
        }
    } else {
        next(); 
    }
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema)
export default User;
