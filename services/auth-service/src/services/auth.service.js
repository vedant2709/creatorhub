import bcrypt from "bcryptjs";
import User from "../models/user.model.js"

export const registerUserService = async ({name, email, password}) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    return user;
}