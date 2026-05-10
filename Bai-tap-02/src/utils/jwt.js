import jwt from "jsonwebtoken";

const getJwtSecret = () => {
    return process.env.JWT_SECRET || "careplus-dev-secret";
};

const getJwtExpiresIn = () => {
    return process.env.JWT_EXPIRES_IN || "1d";
};

const signAccessToken = (payload) => {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: getJwtExpiresIn(),
    });
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, getJwtSecret());
};

module.exports = {
    signAccessToken,
    verifyAccessToken,
};
