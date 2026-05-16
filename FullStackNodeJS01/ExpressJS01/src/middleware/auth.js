require('dotenv').config();
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const white_lists = ["/","/register","/login"];
    
    const isWhiteListed = white_lists.find(item => '/v1/api' + item === req.originalUrl);
    const isProductDetail = req.originalUrl.startsWith('/v1/api/product-detail');

    if (isWhiteListed || isProductDetail){
        next();
    } else {
        if (req?.headers?.authorization?.split(' ')?.[1]){
            const token = req.headers.authorization.split(' ')[1];

            //verify token
            try{
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    name: decoded.name,
                    role: decoded.role,
                    createdBy: "hoidanIT"
                }
                console.log(">>> check token: ", decoded)
                next();
            } catch (error) {
                return res.status(401).json({
                    message: "Token bi het han/hoac khong hop le"
                })
            }
        } else {
            return res.status(401).json({
                message: "Ban chua truyen Access Token o header/Hoac token da het han"
            })
        }
    }
}

module.exports = auth;
