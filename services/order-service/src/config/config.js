import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

if(!PORT){
    throw new Error("PORT is missing in environment variables.");
}

if(!MONGO_URI){
    throw new Error("MONGO_URI is missing in environment variables.");
}

if(!PRODUCT_SERVICE_URL){
    throw new Error("PRODUCT_SERVICE_URL is missing in environment variables.");
}

if(!JWT_SECRET){
    throw new Error("JWT_SECRET is missing in environment variables.");
}

if(!RAZORPAY_KEY_ID){
    throw new Error("RAZORPAY_KEY_ID is missing in environment variables.");
}

if(!RAZORPAY_KEY_SECRET){
    throw new Error("RAZORPAY_KEY_SECRET is missing in environment variables.");
}

if(!INTERNAL_SECRET){
    throw new Error("INTERNAL_SECRET is missing in environment variables.");
}

export const Config = {
    PORT,
    MONGO_URI,
    PRODUCT_SERVICE_URL,
    JWT_SECRET,
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    INTERNAL_SECRET
}