const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = path.join(process.cwd(), "uploads", "products");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const sanitizedName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype?.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Chi duoc upload file hinh anh"));
};

const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
});

module.exports = uploadProductImages;
