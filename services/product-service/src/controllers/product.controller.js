import { createProductService, togglePublishService } from "../services/product.service.js";
import { createProductSchema } from "../validators/product.validator.js";

export const createProductController = async(req,res,next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        console.log("Product request body...",req.body)
         // ✅ 1. Validate body (text fields only)
        const { error } = createProductSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // ✅ 2. Role check
        if(req.user.role !== "creator"){
            return res.status(403).json({
                success: false,
                message: "Only creators can create products"
            });
        }

        // 🔥 3. Extract uploaded files
        const file = req.files?.file?.[0];
        const thumbnail = req.files?.thumbnail?.[0];

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Product file is required"
            });
        }

       let tags = [];

        try {
            tags = req.body.tags ? JSON.parse(req.body.tags) : [];
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: "Invalid tags format. Use JSON array like [\"react\",\"frontend\"]"
            });
        }

        const productData = {
            title: req.body.title,
            description: req.body.description,
            price: Number(req.body.price),
            tags,
            fileUrl: file.path,
            thumbnail: thumbnail?.path || "",
            creatorId: req.user.id
        };

         // ✅ 5. Call service
        const product = await createProductService(productData);

        // ✅ 6. Response
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        next(error)   
    }
}

export const togglePusblishController = async(req,res,next) => {
    try {
        const {id} = req.params;

        // ✅ Role check
        if (req.user.role !== "creator") {
            return res.status(403).json({
                message: "Only creators allowed"
            });
        }

        const product = await togglePublishService(id, req.user.id);

        res.json({
            success: true,
            message: `Product ${
                product.isPublished ? "published" : "unpublished"
            } successfully`,
            data: product
        });
    } catch (error) {
        next(error)
    }
}