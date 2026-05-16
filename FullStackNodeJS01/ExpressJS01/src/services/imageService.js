const Image = require('../models/image');
const fs = require("fs");
const path = require("path");

const addImage = async (productId, url, isMain = false) => {
  return await Image.create({
    productId,
    url,
    isMain
  });
};

const getImagesByProduct = async (productId) => {
  return await Image.find({ productId });
};

const deleteImagesByProduct = async (productId) => {
  const images = await Image.find({ productId });

  await Promise.all(
    images.map(async (image) => {
      if (!image.url?.startsWith("/uploads/")) {
        return;
      }

      const relativePath = image.url.replace(/^\/+/, "");
      const absolutePath = path.join(process.cwd(), relativePath);

      try {
        await fs.promises.unlink(absolutePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }),
  );

  return await Image.deleteMany({ productId });
};

const deleteImageById = async (imageId) => {
  const image = await Image.findById(imageId);
  if (!image) return;

  if (image.url?.startsWith("/uploads/")) {
    const relativePath = image.url.replace(/^\/+/, "");
    const absolutePath = path.join(process.cwd(), relativePath);
    try {
      await fs.promises.unlink(absolutePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  await Image.findByIdAndDelete(imageId);
};

const setMainImage = async (productId, imageId) => {
  await Image.updateMany({ productId }, { isMain: false });
  await Image.findByIdAndUpdate(imageId, { isMain: true });
};

module.exports = {
  addImage,
  getImagesByProduct,
  deleteImagesByProduct,
  deleteImageById,
  setMainImage,
};
