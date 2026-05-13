const Image = require('../models/image');

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
  return await Image.deleteMany({ productId });
};

module.exports = {
  addImage,
  getImagesByProduct,
  deleteImagesByProduct
};
