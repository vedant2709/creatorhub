import express from "express";
import productRoute from "./routes/product.route.js"
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
// app.use((req, _res, next) => {
//   const userHeader = req.headers["x-user"];

//   if (typeof userHeader === "string") {
//     try {
//       req.user = JSON.parse(userHeader);
//     } catch {
//       req.user = null;
//     }
//   }

//   next();
// });

app.use("/api/products", productRoute);

app.use(errorHandler)

export default app;
