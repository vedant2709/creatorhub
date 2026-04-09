import express from "express";
import productRoute from "./routes/product.route.js"
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/api/products", productRoute);

app.use(errorHandler)

export default app;
