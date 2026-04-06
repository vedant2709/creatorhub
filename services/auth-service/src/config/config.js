import dotenv from"dotenv";

dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;
const CLIENT_URL = process.env.CLIENT_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const EMAIL_VERIFY_SECRET = process.env.EMAIL_VERIFY_SECRET;
const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET;

if(!PORT){
    throw new Error("PORT is missing in environment variables.");
}

if(!MONGO_URI){
    throw new Error("MONGO_URI is missing in environment variables.");
}

if(!RESEND_API_KEY){
    throw new Error("RESEND_API_KEY is missing in environment variables.");
}

if(!EMAIL_FROM){
    throw new Error("EMAIL_FROM is missing in environment variables.");
}

if(!CLIENT_URL){
    throw new Error("CLIENT_URL is missing in environment variables.");
}

if(!JWT_SECRET){
    throw new Error("JWT_SECRET is missing in environment variables.");
}

if(!JWT_REFRESH_SECRET){
    throw new Error("JWT_REFRESH_SECRET is missing in environment variables.");
}

if(!EMAIL_VERIFY_SECRET){
    throw new Error("EMAIL_VERIFY_SECRET is missing in environment variables.");
}

if(!RESET_PASSWORD_SECRET){
    throw new Error("RESET_PASSWORD_SECRET is missing in environment variables.");
}

export const Config = {
    PORT,
    MONGO_URI,
    RESEND_API_KEY,
    CLIENT_URL,
    EMAIL_FROM,
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    EMAIL_VERIFY_SECRET,
    RESET_PASSWORD_SECRET
}