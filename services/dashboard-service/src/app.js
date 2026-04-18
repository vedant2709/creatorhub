import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json());
app.use(cookieParser());

// app.use("/api/products", productRoute);
app.get("/api/dashboard",(req,res)=>{
    res.send("Hello from Dashboard Service...")
})

app.use(errorHandler)

export default app;
