import { createProductService, deleteProductService, downloadProductService, getMyProductsService, getProductByIdService, getProductsService, togglePublishService, updateProductService } from "../services/product.service.js";
import { createProductSchema } from "../validators/product.validator.js";

export const createProductController = async(req,res,next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // console.log("Product request body...",req.body)
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

// ✅ Public products
export const getProductsController = async(req,res,next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const result = await getProductsService({page, limit});

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error)
    }
}

export const getProductByIdController = async(req,res,next) => {
    try {
        const { id } = req.params;

        const user = req.user || null; // 🔥 public + private support

        const product = await getProductByIdService(id, user);

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        if (error.message === "Product not found") {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === "Not authorized to view this product") {
            return res.status(403).json({ message: error.message });
        }
        next(error)        
    }
}

// ✅ My products (creator dashboard)
export const getMyProductsController = async(req,res,next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const result = await getMyProductsService({
            userId: req.user.id,
            page,
            limit
        });

        res.json({
            success: true,
            ...result
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

export const updateProductController = async(req,res,next) => {
    try {
        const { id } = req.params;

        // 🔥 Role check
        if (req.user.role !== "creator") {
            return res.status(403).json({
                message: "Only creators allowed"
            });
        }

        // 🔥 Files (optional)
        const file = req.files?.file?.[0];
        const thumbnail = req.files?.thumbnail?.[0];

        let tags = [];

        const updateData = {};

        if (req.body.title) {
            updateData.title = req.body.title;
        }

        if (req.body.description) {
            updateData.description = req.body.description;
        }

        if (req.body.price) {
            updateData.price = Number(req.body.price);
        }

        // 🔥 Tags (only if provided)
        if (req.body.tags) {
            try {
                updateData.tags = JSON.parse(req.body.tags);
            } catch {
                return res.status(400).json({
                    message: "Invalid tags format"
                });
            }
        }

        // 🔥 Files
        if (file) updateData.fileUrl = file.path;
        if (thumbnail) updateData.thumbnail = thumbnail.path;

        const updatedProduct = await updateProductService(
            id,
            req.user.id,
            updateData
        );

        res.json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    } catch (error) {
        if (error.message === "Product not found") {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === "Not authorized") {
            return res.status(403).json({ message: error.message });
        }

        next(error);
    }
}

export const deleteProductController = async(req,res,next) => {
    try {
        const { id } = req.params;

        if (req.user.role !== "creator") {
            return res.status(403).json({
                message: "Only creators allowed"
            });
        }
        
        await deleteProductService(id, req.user.id);

         res.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        if (error.message === "Product not found") {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === "Not authorized") {
            return res.status(403).json({ message: error.message });
        }

        next(error);
    }
}

export const downloadProductController = async(req,res,next) => {
    try {
        const {id} = req.params;

        if(!req.user){
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const data = await downloadProductService(id, req.cookies?.accessToken);

        res.json({
            success: true,
            message: "Access granted",
            data
        })
        
    } catch (error) {
        console.log(error)
        if(error.message === "Product not found"){
            return res.status(404).json({message: error.message})
        }

        if(error.message.includes("not purchased")){
            return res.status(403).json({message: error.message})
        }

        next(error)
    }
}
