const {
    createUserService,
    loginService,
    getUserService,
    updateUserService,
    deleteUserService,
    updateProfileService,
    deleteOwnAccountService
} = require("../services/userService");

const createUser = async (req,res) => {
    const {name, email, password} = req.body;
    const data = await createUserService(name, email, password);
    return res.status(200).json(data)
}

const handleLogin = async (req, res) => {
    const {email, password} = req.body;
    const data = await loginService(email, password);

    return res.status(200).json(data)
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data)
}

const getAccount = async (req, res) =>{
    return res.status(200).json(req.user)
}

const updateUser = async (req, res) => {
    try {
        const data = await updateUserService(req.params.id, req.body);
        return res.status(200).json({
            message: "User updated successfully",
            data
        });
    } catch (error) {
        const statusCode = error.message === "User not found" ? 404 : 400;
        return res.status(statusCode).json({
            message: error.message
        });
    }
}

const deleteUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({
                message: "Ban khong the tu xoa tai khoan admin dang dang nhap"
            })
        }
        const data = await deleteUserService(req.params.id);
        return res.status(200).json(data);
    } catch (error) {
        const statusCode = error.message === "User not found" ? 404 : 400;
        return res.status(statusCode).json({
            message: error.message
        });
    }
}

const updateProfile = async (req, res) => {
    try {
        const data = await updateProfileService(req.user.id, req.body);
        return res.status(200).json({
            message: "Profile updated successfully",
            data
        });
    } catch (error) {
        const statusCode = error.message === "User not found" ? 404 : 400;
        return res.status(statusCode).json({
            message: error.message
        });
    }
}

const deleteOwnAccount = async (req, res) => {
    try {
        const data = await deleteOwnAccountService(req.user.id);
        return res.status(200).json(data);
    } catch (error) {
        const statusCode = error.message === "User not found" ? 404 : 400;
        return res.status(statusCode).json({
            message: error.message
        });
    }
}

module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    updateUser,
    deleteUser,
    updateProfile,
    deleteOwnAccount
}
