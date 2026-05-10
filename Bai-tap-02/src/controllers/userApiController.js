import CRUDService from "../services/CRUDService";

let getAllUsers = async (req, res) => {
    try {
        const users = await CRUDService.getAllUsers();
        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách người dùng",
        });
    }
};

let getUserById = async (req, res) => {
    try {
        const user = await CRUDService.getUserInfoById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Không thể lấy thông tin người dùng",
        });
    }
};

let createUser = async (req, res) => {
    try {
        await CRUDService.createNewUser(req.body);
        return res.status(201).json({
            success: true,
            message: "Tạo người dùng thành công",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Không thể tạo người dùng",
        });
    }
};

let updateUser = async (req, res) => {
    try {
        await CRUDService.updateUserData({
            ...req.body,
            id: req.params.id,
        });
        return res.status(200).json({
            success: true,
            message: "Cập nhật người dùng thành công",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Không thể cập nhật người dùng",
        });
    }
};

let deleteUser = async (req, res) => {
    try {
        await CRUDService.deleteUserById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Xóa người dùng thành công",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Không thể xóa người dùng",
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
