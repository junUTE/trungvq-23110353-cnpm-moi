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
                    name: user.name
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
                        name: user.name
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

module.exports = {
    createUserService,
    loginService,
    getUserService,
    getUserById
}
