import express from "express";
import productRoute from "./routes/product.route.js"
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/products", productRoute);

app.use(errorHandler)

export default app;
