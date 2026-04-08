import Product from "../models/product.model.js"

export const createProductService = async (productData) => {
  const product = await Product.create(productData);
  return product;
};

// 🔥 Public products (only published)
export const getProductsService = async({page, limit}) => {
  const skip = (page - 1) * limit;

  const products = await Product.find({isPublished: true})
  .sort({createdAt: -1})
  .skip(skip)
  .limit(limit);

  const total = await Product.countDocuments({isPublished: true});

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

// 🔥 Creator's products
export const getMyProductsService = async({userId, page, limit}) => {
  const skip = (page - 1) * limit;

  const products = await Product.find({creatorId: userId})
  .sort({createdAt: -1})
  .skip(skip)
  .limit(limit);

  const total = await Product.countDocuments({creatorId: userId});

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

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