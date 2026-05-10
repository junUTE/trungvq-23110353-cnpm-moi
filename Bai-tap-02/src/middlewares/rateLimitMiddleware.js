import { ipKeyGenerator, rateLimit } from "express-rate-limit";

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        const login = (req.body?.login || req.body?.username || req.body?.email || "anonymous")
            .toString()
            .trim()
            .toLowerCase();

        return `${ipKeyGenerator(req.ip)}:${login}`;
    },
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.",
        });
    },
});

module.exports = {
    loginRateLimiter,
};
