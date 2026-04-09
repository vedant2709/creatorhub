import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import orderRoute from "./routes/order.route.js"

const app = express();

app.use(express.json());

app.use("/api/orders", orderRoute);

app.use(errorHandler)

export default app;
