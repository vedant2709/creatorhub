import app from "./app.js"
import { Config } from "./config/config.js"
import connectToDB from "./config/db.js";

const startServer = async () => {
    try {
        await connectToDB();
        app.listen(Config.PORT, () => {
            console.log(`Order service running on port ${Config.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();