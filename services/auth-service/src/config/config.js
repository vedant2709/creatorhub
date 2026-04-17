import dotenv from "dotenv";

dotenv.config();

const {
    PORT,
    MONGO_URI,
    EMAIL_USER,
    EMAIL_PASS,
    CLIENT_URL,
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    EMAIL_VERIFY_SECRET,
    RESET_PASSWORD_SECRET
} = process.env;

if (!PORT) throw new Error("PORT is missing in environment variables.");
if (!MONGO_URI) throw new Error("MONGO_URI is missing in environment variables.");
if (!EMAIL_USER) throw new Error("EMAIL_USER is missing in environment variables.");
if (!EMAIL_PASS) throw new Error("EMAIL_PASS is missing in environment variables.");
if (!CLIENT_URL) throw new Error("CLIENT_URL is missing in environment variables.");
if (!JWT_SECRET) throw new Error("JWT_SECRET is missing in environment variables.");
if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET is missing in environment variables.");
if (!EMAIL_VERIFY_SECRET) throw new Error("EMAIL_VERIFY_SECRET is missing in environment variables.");
if (!RESET_PASSWORD_SECRET) throw new Error("RESET_PASSWORD_SECRET is missing in environment variables.");

export const Config = {
    PORT,
    MONGO_URI,
    EMAIL_USER,
    EMAIL_PASS,
    CLIENT_URL,
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    EMAIL_VERIFY_SECRET,
    RESET_PASSWORD_SECRET
}
