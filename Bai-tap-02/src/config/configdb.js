import db from "../models/index";

const connectDB = async () => {
    try {
        await db.sequelize.authenticate();
        const shouldSyncSchema = process.env.DB_SYNC === "true";
        const shouldAlterSchema = process.env.DB_SYNC_ALTER === "true";

        if (shouldSyncSchema) {
            await db.sequelize.sync({ alter: shouldAlterSchema });
            console.log(
                `Database schema synced (${shouldAlterSchema ? "alter" : "safe sync"} mode).`
            );
        }
        console.log("Kết nối database thành công.");
    } catch (error) {
        console.error("Không thể kết nối database:", error);
        throw error;
    }
};

module.exports = connectDB;
