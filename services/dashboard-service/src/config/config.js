import dotenv from"dotenv";

dotenv.config();

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if(!PORT){
    throw new Error("PORT is missing in environment variables.");
}

if(!JWT_SECRET){
    throw new Error("JWT_SECRET is missing in environment variables.");
}

if(!ORDER_SERVICE_URL){
    throw new Error("ORDER_SERVICE_URL is missing in environment variables.");
}

if(!PRODUCT_SERVICE_URL){
    throw new Error("PRODUCT_SERVICE_URL is missing in environment variables.");
}

if(!GEMINI_API_KEY){
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
}

export const Config = {
    PORT,
    JWT_SECRET,
    ORDER_SERVICE_URL,
    PRODUCT_SERVICE_URL,
    GEMINI_API_KEY
}