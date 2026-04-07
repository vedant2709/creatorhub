import express from "express";

const app = express();

app.use(express.json());

// Middleware to parse user from gateway header
app.use((req, res, next) => {
    const userHeader = req.headers['x-user'];
    if (userHeader) {
        try {
            req.user = JSON.parse(userHeader);
        } catch (e) {
            console.error("Failed to parse x-user header", e);
        }
    }
    next();
});

app.get("/",(req,res)=>{
    return res.status(200).json({
        message: "Product fetched successfully",
        user: req.user
    })
});

app.listen(3002,()=>{
    console.log("Product service running on 3002")
})