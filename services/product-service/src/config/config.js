import dotenv from"dotenv";

dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

if(!PORT){
    throw new Error("PORT is missing in environment variables.");
}

if(!MONGO_URI){
    throw new Error("MONGO_URI is missing in environment variables.");
}

if(!CLOUD_NAME){
    throw new Error("CLOUD_NAME is missing in environment variables.");
}

if(!CLOUD_API_KEY){
    throw new Error("CLOUD_API_KEY is missing in environment variables.");
}

if(!CLOUD_API_SECRET){
    throw new Error("CLOUD_API_SECRET is missing in environment variables.");
}

if(!JWT_SECRET){
    throw new Error("JWT_SECRET is missing in environment variables.");
}

if(!ORDER_SERVICE_URL){
    throw new Error("ORDER_SERVICE_URL is missing in environment variables.");
}

export const Config = {
    PORT,
    MONGO_URI,
    CLOUD_NAME,
    CLOUD_API_KEY,
    CLOUD_API_SECRET,
    JWT_SECRET,
    ORDER_SERVICE_URL
}