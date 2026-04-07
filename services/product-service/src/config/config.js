import dotenv from"dotenv";

dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

if(!PORT){
    throw new Error("PORT is missing in environment variables.");
}

if(!MONGO_URI){
    throw new Error("MONGO_URI is missing in environment variables.");
}

export const Config = {
    PORT,
    MONGO_URI
}