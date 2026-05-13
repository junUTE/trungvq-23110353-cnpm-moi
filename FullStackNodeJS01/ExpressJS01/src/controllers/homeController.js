const homepageService = require('../services/homePageService');

const getHomepage = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await homepageService.getHomepageData(userId);

    res.json({
      message: 'Success',
      data
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getHomepage
};