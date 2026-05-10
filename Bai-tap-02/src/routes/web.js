import express from "express";
import authController from "../controllers/authController";
import homeController from "../controllers/homeController";
import profileController from "../controllers/profileController";
import authRoutes from "./auth";
import apiRoutes from "./api";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", (req, res) => {
        return res.redirect("/home");
    });
    router.get('/home', homeController.getHomePage);
    router.get('/about', homeController.getAboutPage);
    router.get('/login', authController.getLoginPage);
    router.get('/register', authController.getRegisterPage);
    router.get('/crud', homeController.getCRUD);
    router.get('/get-crud', homeController.getFindAllCRUD);
    router.get('/edit-crud', homeController.getEditCRUD);
    router.get('/user/profile', profileController.getUserProfilePage);

    app.use("/", authRoutes);
    app.use("/", apiRoutes);
    return app.use("/", router);
};
module.exports = initWebRoutes;
