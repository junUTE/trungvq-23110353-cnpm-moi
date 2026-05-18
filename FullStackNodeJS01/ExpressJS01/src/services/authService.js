const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mailService = require("./mailService");

const OTP_EXPIRE_MINUTES = 5;
const TEMP_LOCK_MINUTES = 5;
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEMP_PASSWORD_PLACEHOLDER = "__PENDING_VERIFICATION__";
const MAX_OTP_FAILED_ATTEMPTS = 5;

const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

const buildLoginError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const sendVerificationCode = async (email, username) => {
    const normalizedEmail = (email || "").trim();
    const normalizedUsername = (username || "").trim();
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
        throw buildLoginError("Email không hợp lệ", 400);
    }
    if (!normalizedUsername) {
        throw buildLoginError("Username không được để trống", 400);
    }
    const usernameExists = await User.findOne({ username: normalizedUsername });
    if (usernameExists) {
        throw buildLoginError("Username đã tồn tại.", 409);
    }
    const user = await User.findOne({ email: normalizedEmail });
    if (user && user.isVerified) {
        throw buildLoginError("Email đã được đăng ký và xác thực.", 409);
    }
    if (user && user.lockUntil && new Date(user.lockUntil) > new Date()) {
        const lockMinutes = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
        throw buildLoginError(`Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${lockMinutes} phút.`, 423);
    }
    const otpCode = generateOTP();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
    if (user) {
        user.otpCode = hashedOtp;
        user.otpExpiresAt = otpExpiresAt;
        user.failedLoginAttempts = 0;
        await user.save();
    } else {
        // Nếu chưa có user, tạo user tạm với email và OTP (chưa xác thực)
        const hashedPassword = await bcrypt.hash(TEMP_PASSWORD_PLACEHOLDER, 10);
        await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            otpCode: hashedOtp,
            otpExpiresAt,
            isVerified: false,
            isActive: true,
            failedLoginAttempts: 0,
            role: "user"
        });
    }
    await mailService.sendVerificationEmail(normalizedEmail, otpCode, OTP_EXPIRE_MINUTES);
    return { success: true, message: "Mã xác thực đã được gửi tới email." };
};

const registerUser = async ({ username, email, password, verificationCode }) => {
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
        throw buildLoginError("Mã xác thực không hợp lệ (cần 5 số)", 400);
    }
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        throw buildLoginError("Bạn cần nhận mã xác thực trước.", 404);
    }
    if (user.isVerified) {
        throw buildLoginError("Email đã được đăng ký và xác thực.", 409);
    }
    if (!user.otpCode || !user.otpExpiresAt) {
        throw buildLoginError("Mã xác thực hiện không còn hiệu lực. Vui lòng bấm 'Gửi lại mã'.", 410);
    }

    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
        const lockMinutes = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
        throw buildLoginError(`Bạn đã bị khóa. Vui lòng thử lại sau ${lockMinutes} phút.`, 423);
    }

    const isOtpValid = await bcrypt.compare(normalizedVerificationCode, user.otpCode);
    if (!isOtpValid) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

        if (user.failedLoginAttempts >= MAX_OTP_FAILED_ATTEMPTS) {
            user.otpCode = null;
            user.otpExpiresAt = null;
            user.failedLoginAttempts = 0;
            user.lockUntil = new Date(Date.now() + TEMP_LOCK_MINUTES * 60 * 1000);
            await user.save();
            throw buildLoginError(`Bạn đã nhập sai mã xác thực ${MAX_OTP_FAILED_ATTEMPTS} lần. Mã cũ đã bị hủy và bạn bị khóa ${TEMP_LOCK_MINUTES} phút.`, 429);
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
    const usernameExists = await User.findOne({ username: normalizedUsername });
    if (usernameExists) {
        throw buildLoginError("Username đã tồn tại.", 409);
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    user.username = normalizedUsername;
    user.name = normalizedUsername; // Keep name synced for backward compat
    user.password = hashedPassword;
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    user.failedLoginAttempts = 0;
    await user.save();
    return { success: true, message: "Đăng ký thành công!" };
};

module.exports = {
    sendVerificationCode,
    registerUser,
};
