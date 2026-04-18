import app from "./app.js"
import { Config } from "./config/config.js"

const startServer = async () => {
    try {
        app.listen(Config.PORT, () => {
            console.log(`Product service running on port ${Config.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();