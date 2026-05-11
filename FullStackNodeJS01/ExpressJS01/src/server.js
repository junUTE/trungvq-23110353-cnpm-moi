require('dotenv').config();

const express = require('express');
const configViewEngine = require('./config/viewEngine');
const connection = require('./config/database');
const cors = require('cors');
const apiRouter = require('./routes/api');
const { getHomePage } = require('./controllers/homeController');
const app = express();

const port = process.env.PORT || 8888;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
configViewEngine(app);

const webAPI = express.Router();
webAPI.get('/', getHomePage);
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
