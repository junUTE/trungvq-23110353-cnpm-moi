import bcrypt from "bcryptjs";
import db from "../models/index";

const salt = bcrypt.genSaltSync(10);
const safeUserAttributes = {
    exclude: ["password", "otpCode"],
};

const parseBooleanField = (value) => {
    if (value === "" || value === null || typeof value === "undefined") {
        return null;
    }

    return value === "1" || value === 1 || value === true || value === "true";
};

let createNewUser = async (data) => {
    if (!data?.username || !data?.email || !data?.password) {
        throw new Error("Username, email và mật khẩu là bắt buộc");
    }

    let hashPasswordFromBcrypt = bcrypt.hashSync(data.password, salt);
    await db.User.create({
        username: data.username.trim(),
        email: data.email.trim(),
        password: hashPasswordFromBcrypt,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        address: data.address || null,
        gender: parseBooleanField(data.gender),
        phone: data.phone || null,
        avatar: data.avatar || null,
        role: data.role === "admin" ? "admin" : "user",
        isActive: typeof data.isActive === "undefined" ? true : parseBooleanField(data.isActive),
        isLocked: typeof data.isLocked === "undefined" ? false : parseBooleanField(data.isLocked),
    });

    return "OK: Create new user successfully";
};

let hashUserPassword = async (password) => {
    return bcrypt.hashSync(password, salt);
};

let getAllUsers = async () => {
    return db.User.findAll({
        attributes: safeUserAttributes,
        raw: true,
        order: [["id", "DESC"]],
    });
};

let getUserInfoById = async (userId) => {
    return db.User.findOne({
        where: { id: userId },
        attributes: safeUserAttributes,
        raw: true,
    });
};

let updateUserData = async (data) => {
    let user = await db.User.findOne({
        where: { id: data.id },
    });

    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }

    if (data.username) user.username = data.username.trim();
    if (data.email) user.email = data.email.trim();
    if (typeof data.firstName !== "undefined") user.firstName = data.firstName || null;
    if (typeof data.lastName !== "undefined") user.lastName = data.lastName || null;
    if (typeof data.address !== "undefined") user.address = data.address || null;
    if (typeof data.gender !== "undefined") user.gender = parseBooleanField(data.gender);
    if (typeof data.phone !== "undefined") user.phone = data.phone || null;
    if (typeof data.avatar !== "undefined") user.avatar = data.avatar || null;
    if (data.role) user.role = data.role === "admin" ? "admin" : "user";
    if (typeof data.isActive !== "undefined") user.isActive = parseBooleanField(data.isActive);
    if (typeof data.isLocked !== "undefined") user.isLocked = parseBooleanField(data.isLocked);
    if (data.password) {
        user.password = await hashUserPassword(data.password);
    }

    await user.save();
    return getAllUsers();
};

let deleteUserById = async (userId) => {
    let user = await db.User.findOne({
        where: { id: userId },
    });

    if (user) {
        await user.destroy();
    }
};

module.exports = {
    createNewUser: createNewUser,
    hashUserPassword: hashUserPassword,
    getAllUsers: getAllUsers,
    getUserInfoById: getUserInfoById,
    updateUserData: updateUserData,
    deleteUserById: deleteUserById,
};
