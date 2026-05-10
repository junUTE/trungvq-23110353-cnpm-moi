let getUserProfilePage = (req, res) => {
    return res.render("userProfile.ejs");
};

module.exports = {
    getUserProfilePage,
};
