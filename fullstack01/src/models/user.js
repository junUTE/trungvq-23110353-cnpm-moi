"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Giúp định nghĩa các quan hệ giữa các model với nhau (nếu có)
     * Phương thức này sẽ được gọi tự động bởi Sequelize khi tất cả các model đã được khởi tạo xong
     * Tham số 'models' chứa tất cả các model đã được định nghĩa trong ứng dụng, cho phép chúng ta thiết lập các quan hệ giữa User và các model khác (ví dụ: User có thể có nhiều bài viết, hoặc User thuộc về một nhóm nào đó, v.v.)
     **/
    static associate(models) {
      // định nghĩa quan hệ giữa User và các model khác ở đây
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      address: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      gender: DataTypes.BOOLEAN,
      image: DataTypes.STRING,
      roleId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
