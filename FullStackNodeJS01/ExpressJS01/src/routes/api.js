const express = require("express");
const {
  createUser,
  handleLogin,
  getUser,
  getAccount,
} = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/", (req, res) => {
  return res.status(200).json("Hello world api");
});
router.post("/register", createUser);
router.post("/login", handleLogin);
router.get("/user", getUser);
router.get("/account", getAccount);

module.exports = router;
