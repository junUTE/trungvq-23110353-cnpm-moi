require('dotenv').config();
const User = require('../models/user');
const brypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        const user = await User.findOne({ email });
        if (user) {
            console.log('User already exists');
            return null;
        }
        const hashedPassword = await brypt.hash(password, saltRounds);

        let result = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: 'user'
        });
        return result;
    } catch (error){
        console.error('Error creating user:', error);
        throw error;
    }
};

const loginService = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (user){
            const isPasswordValid = await brypt.compare(password, user.password);
            if (!isPasswordValid) {
                return{
                    EC: 2,
                    EM: "Email or password is incorrect",
                }
            } else {
                const payload = {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
                const accessToken = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRES
                    }
                )
                return {
                    EC: 0,
                    access_token: accessToken,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                };
            }
        } else {
            return {
                EC: 1,
                EM: "Email or password is incorrect",
            }
        }
    } catch (error) {
        console.error('Error during login:', error);
        return null;
    }
};

const getUserService = async (email) => {
    try {
        let result = await User.find({}).select("-password");
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const getUserById = async (id) => {
    try {
        const user = await User.findById(id).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        throw error;
    }
}

const updateUserService = async (id, data) => {
    try {
        const { name, email, role } = data;
        const user = await User.findById(id);

        if (!user) {
            throw new Error("User not found");
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                throw new Error("Email already exists");
            }
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role;

        await user.save();
        return await User.findById(id).select("-password");
    } catch (error) {
        throw error;
    }
}

const deleteUserService = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error("User not found");
        }

        await User.findByIdAndDelete(id);
        return { message: "User deleted successfully" };
    } catch (error) {
        throw error;
    }
}

const updateProfileService = async (id, data) => {
    try {
        const { name, email, password } = data;
        const user = await User.findById(id);

        if (!user) {
            throw new Error("User not found");
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                throw new Error("Email already exists");
            }
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (password) {
            user.password = await brypt.hash(password, saltRounds);
        }

        await user.save();
        return await User.findById(id).select("-password");
    } catch (error) {
        throw error;
    }
}

const deleteOwnAccountService = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error("User not found");
        }

        await User.findByIdAndDelete(id);
        return { message: "Account deleted successfully" };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createUserService,
    loginService,
    getUserService,
    getUserById,
    updateUserService,
    deleteUserService,
    updateProfileService,
    deleteOwnAccountService
}
