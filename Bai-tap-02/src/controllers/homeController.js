import CRUDService from "../services/CRUDService";

let getHomePage = async (req, res) => {
    try {
        let users = await CRUDService.getAllUsers();
        return res.render("homepage.ejs", { users });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Lỗi máy chủ");
    }
};

let getAboutPage = async (req, res) => {
    return res.render("about.ejs");
};

let getCRUD = (req, res) => {
    return res.render("crud.ejs");
};

let getFindAllCRUD = async (req, res) => {
    try {
        return res.render("displayCRUD.ejs");
    } catch (e) {
        console.log(e);
        return res.status(500).send("Lỗi máy chủ");
    }
};

let getEditCRUD = async (req, res) => {
    try {
        let id = req.query.id;
        if (!id) return res.redirect("/get-crud");

        return res.render("editCRUD.ejs", { userId: id });
    } catch (e) {
        console.log(e);
        return res.status(500).send("Lỗi máy chủ");
    }
};

module.exports = {
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    getFindAllCRUD: getFindAllCRUD,
    getEditCRUD: getEditCRUD,
};
