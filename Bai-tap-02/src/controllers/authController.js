import authService from "../services/authService";

let getLoginPage = (req, res) => {
    return res.render("login.ejs");
};

let getRegisterPage = (req, res) => {
    return res.render("register.ejs");
};

let login = async (req, res) => {
    try {
        const result = await authService.loginUser({
            login: req.body.login,
            password: req.body.password,
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Đăng nhập thất bại",
        });
    }
};

let getCurrentSession = async (req, res) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);
        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Không thể lấy thông tin phiên đăng nhập",
        });
    }
};

// Gửi mã xác thực qua email
let sendVerificationCode = async (req, res) => {
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

// Đăng ký tài khoản
let register = async (req, res) => {
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
    getLoginPage,
    getRegisterPage,
    login,
    getCurrentSession,
    sendVerificationCode,
    register,
};
