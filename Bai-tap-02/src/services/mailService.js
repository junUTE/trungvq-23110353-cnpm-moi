// src/services/mailService.js

require("dotenv").config();
const nodemailer = require("nodemailer");

// Cấu hình transporter dùng biến môi trường để bảo mật thông tin
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true cho 465, false cho 587
  pool: true,
  maxConnections: 1,
  maxMessages: 20,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (to, otpCode, expireMinutes) => {
  const subject = "Xác thực tài khoản CarePlus của bạn";
  const text = `Xin chào,\n\nCảm ơn bạn đã đăng ký tài khoản tại CarePlus.\nĐể hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác thực (OTP) dưới đây:\n\nMã xác thực của bạn: ${otpCode}\nMã này sẽ hết hạn sau ${expireMinutes} phút.\n\nVui lòng không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn cho tài khoản của bạn.\nNếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email này.\n\nTrân trọng,\nĐội ngũ CarePlus\n\nEmail này được gửi tự động, vui lòng không trả lời lại.`;
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[MAIL] Đã gửi email xác thực tới: ${to}`);
    return true;
  } catch (err) {
    console.error("Lỗi gửi email:", {
      message: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
      to,
    });
    const error = new Error("Không gửi được email xác thực. Vui lòng thử lại sau.");
    error.statusCode = 503;
    throw error;
  }
};

// Hàm gửi email chung (có thể dùng cho các mục đích khác)
const sendEmail = async (to, subject, text) => {
  // TODO: Tích hợp service gửi email thực tế (nodemailer, ...)
  console.log(`[MAIL] To: ${to} | Subject: ${subject} | Text: ${text}`);
  return true;
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
};
