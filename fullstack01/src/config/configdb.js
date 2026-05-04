const { Sequelize } = require("sequelize");

// Cấu hình kết nối đến cơ sở dữ liệu MySQL
const sequelize = new Sequelize("fullstack01", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});
// Hàm kiểm tra kết nối đến cơ sở dữ liệu
let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
module.exports = { sequelize, connectDB };
