require('dotenv').config();

const express = require('express');
const path = require("path");
const configViewEngine = require('./config/viewEngine');
const connection = require('./config/database');
const cors = require('cors');
const apiRouter = require('./routes/api');
const { getHomepage } = require('./controllers/homeController');
const app = express();

const port = process.env.PORT || 8888;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
configViewEngine(app);

const webAPI = express.Router();
webAPI.get('/', getHomepage);
app.use('/', webAPI);
app.use('/v1/api', apiRouter);

(async () => {
    try {
        await connection();
        app.listen(port, () => {
            console.log(`Backend NodeJS App listening on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
})();
