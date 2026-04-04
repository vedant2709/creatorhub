import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    token: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
        type: String,
        enum: ["user","creator"],
        default: "user"
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    refreshTokens: [refreshTokenSchema]
})

const userModel = mongoose.model("User", userSchema);

export default userModel;