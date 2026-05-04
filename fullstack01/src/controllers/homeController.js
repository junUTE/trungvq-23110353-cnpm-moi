const db = require("../models/index");
const CRUDService = require("../../services/CRUDService");

// Hàm xử lý trang chủ
let getHomePage = async (req, res) => {
  try {
    let data = await db.User.findAll();
    console.log("------------------");
    console.log(data);
    console.log("------------------");
    return res.render("homepage.ejs", {
      data: JSON.stringify(data),
    });
  } catch (e) {
    console.log(e);
  }
};

// Hàm xử lý trang giới thiệu
let getAboutPage = (req, res) => {
  return res.render("test/about.ejs");
};

// Hàm xử lý trang CRUD
let getCRUD = (req, res) => {
  return res.render("crud.ejs");
};

// Hàm xử lý trang hiển thị tất cả người dùng
let getFindAllCRUD = async (req, res) => {
  let data = await CRUDService.getAllUser();
  return res.render("users/findAllUser.ejs", {
    data: data,
  });
};

// Hàm xử lý tạo mới người dùng
let postCRUD = async (req, res) => {
  let message = await CRUDService.createNewUser(req.body);
  console.log(message);
  return res.send("Post crud to server");
};

// Hàm lấy thông tin người dùng để chỉnh sửa
let getEditCRUD = async (req, res) => {
  let userId = req.query.id;
  if (userId) {
    let userData = await CRUDService.getUserInfoById(userId);
    return res.render("users/updateUser.ejs", {
      data: userData,
    });
  } else {
    return res.send("User not found!");
  }
};

// Hàm cập nhật người dùng
let putCRUD = async (req, res) => {
  let data = await CRUDService.updateUser(req.body);
  return res.render("users/updateUser.ejs", {
    data: data,
  });
};

// Hàm xóa người dùng
let deleteCRUD = async (req, res) => {
  let id = req.query.id;
  if (id) {
    await CRUDService.deleteUserById(id);
    return res.send("Delete user succeed!");
  } else {
    return res.send("User not found!");
  }
};

module.exports = {
  getHomePage: getHomePage,
  getAboutPage: getAboutPage,
  getCRUD: getCRUD,
  getFindAllCRUD: getFindAllCRUD,
  postCRUD: postCRUD,
  getEditCRUD: getEditCRUD,
  putCRUD: putCRUD,
  deleteCRUD: deleteCRUD,
};
