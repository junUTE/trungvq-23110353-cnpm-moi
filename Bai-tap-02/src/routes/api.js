import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import userApiController from "../controllers/userApiController";

let router = express.Router();

router.use("/api/users", authMiddleware.verifyToken, authMiddleware.requireRole("admin"));
router.get("/api/users", userApiController.getAllUsers);
router.get("/api/users/:id", userApiController.getUserById);
router.post("/api/users", userApiController.createUser);
router.put("/api/users/:id", userApiController.updateUser);
router.delete("/api/users/:id", userApiController.deleteUser);

module.exports = router;
