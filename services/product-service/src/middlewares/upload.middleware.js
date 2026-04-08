import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "products",
        resource_type: "auto" // supports image + pdf + zip
    }
})

const upload = multer({storage});

export default upload;