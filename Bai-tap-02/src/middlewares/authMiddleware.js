import db from "../models/index";
import jwtUtils from "../utils/jwt";

const getBearerToken = (req) => {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
        return null;
    }

    return authHeader.slice(7).trim();
};

let verifyToken = async (req, res, next) => {
    try {
        const token = getBearerToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Bạn chưa đăng nhập",
            });
        }

        const decoded = jwtUtils.verifyAccessToken(token);
        const user = await db.User.findOne({
            where: { id: decoded.id },
            attributes: {
                exclude: ["password", "otpCode"],
            },
            raw: true,
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Phiên đăng nhập không hợp lệ",
            });
        }

        if (!user.isActive || user.isLocked) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản hiện không thể truy cập",
            });
        }

        if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
            return res.status(423).json({
                success: false,
                message: "Tài khoản đang tạm khóa. Vui lòng thử lại sau.",
            });
        }

        req.user = user;
        req.token = token;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn",
        });
    }
};

let requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền truy cập tài nguyên này",
            });
        }

        return next();
    };
};

module.exports = {
    verifyToken,
    requireRole,
};
