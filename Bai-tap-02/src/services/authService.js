import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import db from "../models/index";
import jwtUtils from "../utils/jwt";
import mailService from "./mailService";

const OTP_LENGTH = 5;
const OTP_EXPIRE_MINUTES = 5;
const MAX_FAILED_ATTEMPTS = 5;
const TEMP_LOCK_MINUTES = 15;
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEMP_PASSWORD_PLACEHOLDER = "__PENDING_VERIFICATION__";
const MAX_OTP_FAILED_ATTEMPTS = 5;

const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

let sendVerificationCode = async (email, username) => {
    const normalizedEmail = (email || "").trim();
    const normalizedUsername = (username || "").trim();
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
        throw buildLoginError("Email không hợp lệ", 400);
    }
    if (!normalizedUsername) {
        throw buildLoginError("Username không được để trống", 400);
    }
    const usernameExists = await db.User.findOne({ where: { username: normalizedUsername } });
    if (usernameExists) {
        throw buildLoginError("Username đã tồn tại.", 409);
    }
    const user = await db.User.findOne({ where: { email: normalizedEmail } });
    if (user && user.isVerified) {
        throw buildLoginError("Email đã được đăng ký và xác thực.", 409);
    }
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
    if (user) {
        user.otpCode = otpCode;
        user.otpExpiresAt = otpExpiresAt;
        user.failedLoginAttempts = 0;
        await user.save();
    } else {
        // Nếu chưa có user, tạo user tạm với email và OTP (chưa xác thực)
        await db.User.create({
            email: normalizedEmail,
            password: bcrypt.hashSync(TEMP_PASSWORD_PLACEHOLDER, 10),
            otpCode,
            otpExpiresAt,
            isVerified: false,
            isActive: true,
            failedLoginAttempts: 0,
        });
    }
    await mailService.sendVerificationEmail(normalizedEmail, otpCode, OTP_EXPIRE_MINUTES);
    return { success: true, message: "Mã xác thực đã được gửi tới email." };
};

let registerUser = async ({ username, email, password, verificationCode }) => {
    const normalizedUsername = (username || "").trim();
    const normalizedEmail = (email || "").trim();
    const normalizedPassword = password || "";
    const normalizedVerificationCode = (verificationCode || "").trim();

    if (!normalizedUsername || !normalizedEmail || !normalizedPassword || !normalizedVerificationCode) {
        throw buildLoginError("Vui lòng nhập đầy đủ thông tin", 400);
    }
    if (!EMAIL_REGEX.test(normalizedEmail)) {
        throw buildLoginError("Email không hợp lệ", 400);
    }
    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
        throw buildLoginError(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`, 400);
    }
    if (!/^\d{5}$/.test(normalizedVerificationCode)) {
        throw buildLoginError("Mã xác thực không hợp lệ", 400);
    }
    const user = await db.User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
        throw buildLoginError("Bạn cần nhận mã xác thực trước.", 404);
    }
    if (user.isVerified) {
        throw buildLoginError("Email đã được đăng ký và xác thực.", 409);
    }
    if (!user.otpCode || !user.otpExpiresAt) {
        throw buildLoginError("Mã xác thực hiện không còn hiệu lực. Vui lòng bấm 'Gửi lại mã'.", 410);
    }
    if (user.otpCode !== normalizedVerificationCode) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

        if (user.failedLoginAttempts >= MAX_OTP_FAILED_ATTEMPTS) {
            user.otpCode = null;
            user.otpExpiresAt = null;
            user.failedLoginAttempts = 0;
            await user.save();
            throw buildLoginError("Bạn đã nhập sai mã xác thực 5 lần. Mã cũ đã bị hủy, vui lòng bấm 'Gửi lại mã'.", 429);
        }

        await user.save();
        const remainingAttempts = MAX_OTP_FAILED_ATTEMPTS - user.failedLoginAttempts;
        throw buildLoginError(`Mã xác thực không đúng. Bạn còn ${remainingAttempts} lần thử.`, 400);
    }
    if (new Date(user.otpExpiresAt) < new Date()) {
        user.otpCode = null;
        user.otpExpiresAt = null;
        user.failedLoginAttempts = 0;
        await user.save();
        throw buildLoginError("Mã xác thực đã hết hạn.", 410);
    }
    // Kiểm tra username trùng
    const usernameExists = await db.User.findOne({ where: { username: normalizedUsername } });
    if (usernameExists) {
        throw buildLoginError("Username đã tồn tại.", 409);
    }
    // Hash password
    const hashedPassword = bcrypt.hashSync(normalizedPassword, 10);
    user.username = normalizedUsername;
    user.password = hashedPassword;
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    user.failedLoginAttempts = 0;
    await user.save();
    return { success: true, message: "Đăng ký thành công!" };
};

const sanitizeUser = (user) => {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        isLocked: user.isLocked,
        lastLoginAt: user.lastLoginAt,
    };
};

const buildRedirectUrlByRole = (role) => {
    return role === "admin" ? "/get-crud" : "/user/profile";
};

const buildLoginError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const resetFailedAttempts = async (user) => {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();
};

const registerFailedAttempt = async (user) => {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + TEMP_LOCK_MINUTES * 60 * 1000);
    }

    await user.save();
};

const findUserByLogin = async (login) => {
    return db.User.findOne({
        where: {
            [Op.or]: [
                { email: login },
                { username: login },
            ],
        },
    });
};

let loginUser = async ({ login, password }) => {
    const normalizedLogin = (login || "").trim();
    const normalizedPassword = password || "";

    if (!normalizedLogin || !normalizedPassword) {
        throw buildLoginError("Username/email và mật khẩu không được để trống", 400);
    }

    if (normalizedLogin.includes("@") && !EMAIL_REGEX.test(normalizedLogin)) {
        throw buildLoginError("Email đăng nhập không đúng định dạng", 400);
    }

    const user = await findUserByLogin(normalizedLogin);
    if (!user) {
        throw buildLoginError("Sai tài khoản hoặc mật khẩu", 401);
    }

    if (!user.isActive || user.isLocked) {
        throw buildLoginError("Tài khoản đã bị khóa hoặc vô hiệu hóa", 403);
    }

    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
        throw buildLoginError("Tài khoản đang tạm khóa. Vui lòng thử lại sau.", 423);
    }

    const isPasswordValid = bcrypt.compareSync(normalizedPassword, user.password);
    if (!isPasswordValid) {
        await registerFailedAttempt(user);
        throw buildLoginError("Sai tài khoản hoặc mật khẩu", 401);
    }

    await resetFailedAttempts(user);

    const token = jwtUtils.signAccessToken({
        id: user.id,
        role: user.role,
        username: user.username,
    });

    return {
        success: true,
        message: "Đăng nhập thành công",
        token,
        role: user.role,
        redirectUrl: buildRedirectUrlByRole(user.role),
        user: sanitizeUser(user),
    };
};

let getCurrentUser = async (userId) => {
    const user = await db.User.findOne({
        where: { id: userId },
    });

    if (!user) {
        throw buildLoginError("Không tìm thấy người dùng", 404);
    }

    return sanitizeUser(user);
};

module.exports = {
    loginUser,
    getCurrentUser,
    buildRedirectUrlByRole,
    sendVerificationCode,
    registerUser,
};
