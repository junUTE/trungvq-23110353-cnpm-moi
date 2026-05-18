const authService = require("../services/authService");
const { loginService } = require("../services/userService");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Giữ lại luồng đăng nhập cũ như yêu cầu
        const data = await loginService(email, password);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Đăng nhập thất bại",
        });
    }
};

const sendVerificationCode = async (req, res) => {
    try {
        const { email, username } = req.body;
        const result = await authService.sendVerificationCode(email, username);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không gửi được mã xác thực",
        });
    }
};

const register = async (req, res) => {
    try {
        const { username, email, password, verificationCode } = req.body;
        const result = await authService.registerUser({ username, email, password, verificationCode });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Đăng ký thất bại",
        });
    }
};

module.exports = {
    login,
    sendVerificationCode,
    register,
};
