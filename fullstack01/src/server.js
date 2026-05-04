const express = require("express");
const bodyParser = require("body-parser");
const viewEngine = require("./config/viewEngine");
const initWebRoute = require("./route/web");
const { connectDB } = require("./config/configdb");
require("dotenv").config();

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
viewEngine(app);
initWebRoute(app);
connectDB();

let port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
