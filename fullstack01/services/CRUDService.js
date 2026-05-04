const crypto = require("crypto");
const db = require("../src/models/index");

const salt = "fullstack01-demo-salt";

// Hàm createNewUser để tạo một người dùng mới trong cơ sở dữ liệu
let createNewUser = async (data) => {
  return new Promise(async (resolve, reject) => {
    // Tạo một Promise đảm bảo luôn trả kết quả, trong xử lý bất đồng bộ
    try {
      let hashPasswordFromBcrypt = await hashUserPassword(data.password); // Hash mật khẩu người dùng
      await db.User.create({
        // Tạo một bản ghi mới trong bảng User với dữ liệu đã được hash mật khẩu
        email: data.email,
        password: hashPasswordFromBcrypt,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        phoneNumber: data.phoneNumber,
        gender: data.gender === "1" ? true : false,
        roleId: data.roleId,
      });
      resolve("ok create a new user succeed!"); // Trả về kết quả thành công
    } catch (e) {
      reject(e); // Trả về lỗi nếu có
    }
  });
};

// Hàm hashUserPassword để hash mật khẩu người dùng
let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const hashPassword = crypto
        .createHash("sha256")
        .update(`${password}${salt}`)
        .digest("hex");
      resolve(hashPassword); // Trả về mật khẩu đã được hash
    } catch (e) {
      reject(e); // Trả về lỗi nếu có
    }
  });
};

// Hàm getAllUser CRUD để lấy tất cả người dùng
let getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = db.User.findAll({
        raw: true,
      }); // Lấy tất cả người dùng từ cơ sở dữ liệu
      resolve(users); // Trả về danh sách người dùng
    } catch (e) {
      reject(e); // Trả về lỗi nếu có
    }
  });
};

// Hàm getOne CRUD để lấy thông tin người dùng theo ID
let getUserInfoById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: userId }, // Điều kiện tìm kiếm người dùng theo ID
        raw: true,
      });
      if (user) {
        resolve(user); // Trả về thông tin người dùng nếu tìm thấy
      } else {
        resolve([]); // Trả về một mảng rỗng nếu không tìm thấy người dùng
      }
    } catch (e) {
      reject(e); // Trả về lỗi nếu có
    }
  });
};

// Hàm put CRUD để cập nhật thông tin người dùng
let updateUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: data.id }, // Điều kiện tìm kiếm người dùng theo ID
      });
      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        await user.save(); // Lưu các thay đổi vào cơ sở dữ liệu
        resolve(user.get({ plain: true }));
      } else {
        resolve(); // Trả về undefined nếu không tìm thấy người dùng
      }
    } catch (e) {
      reject(e); // Trả về lỗi nếu có
    }
  });
};

let deleteUserById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: userId }, // Điều kiện tìm kiếm người dùng theo ID
      });
      if (user) {
        await user.destroy(); // Xóa người dùng khỏi cơ sở dữ liệu
      }
      resolve(); // Trả về undefined sau khi xóa
    } catch (e) {
      reject(e); // Trả về lỗi nếu có
    }
  });
};

module.exports = {
  createNewUser: createNewUser,
  getAllUser: getAllUser,
  getUserInfoById: getUserInfoById,
  updateUser: updateUser,
  deleteUserById: deleteUserById,
};
