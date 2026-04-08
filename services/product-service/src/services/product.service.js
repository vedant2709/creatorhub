import Product from "../models/product.model.js"

export const createProductService = async (productData) => {
  const product = await Product.create(productData);
  return product;
};

export const togglePublishService = async (productId, userId) => {
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
        success: false,
        message: "Product not found."
    });
  }

  // 🔥 Ownership check
  if(product.creatorId !== userId){
    return res.status(403).json({
        success: false,
        message: "Unauthorized access."
    });
  }

  // 🔥 Toggle publish
  product.isPublished = !product.isPublished;

  await product.save();

  return product;
}