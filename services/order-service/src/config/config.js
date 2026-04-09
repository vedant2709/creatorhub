import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

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

export const Config = {
    PORT,
    MONGO_URI,
    PRODUCT_SERVICE_URL,
    JWT_SECRET
}