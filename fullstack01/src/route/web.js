const express = require("express");
const homeController = require("../controllers/homeController");

let router = express.Router();

let initWebRoute = (app) => {
  // Định nghĩa route cho trang chủ
  /*
  router.get("/", (req, res) => {
    return res.send("This is home page");
  });
  */
  router.get("/", homeController.getFindAllCRUD);
  // Định nghĩa route cho các trang khác
  router.get("/about", homeController.getAboutPage);
  router.get("/crud", homeController.getCRUD);
  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.getFindAllCRUD);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get("/delete-crud", homeController.deleteCRUD);

  return app.use("/", router); // url mặc định
};

module.exports = initWebRoute; // Xuất hàm initWebRoute để sử dụng trong file khác (ví dụ: app.js)
