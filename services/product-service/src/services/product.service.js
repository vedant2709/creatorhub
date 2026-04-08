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

export const getProductByIdService = async(productId, user) => {
  const product = await Product.findById(productId);

   if (!product) {
    throw new Error("Product not found");
  }

  // 🔥 If not published, only creator can access
  if(!product.isPublished){
    if(!user || product.creatorId !== user.id){
      throw new Error("Not authorized to view this product");
    }
  }

  return product;
}

export const togglePublishService = async (productId, userId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found.")
  }

  // 🔥 Ownership check
  if(product.creatorId !== userId){
    throw new Error("Unauthorized access.")
  }

  // 🔥 Toggle publish
  product.isPublished = !product.isPublished;

  await product.save();

  return product;
}

export const updateProductService = async(productId, userId, updateData) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  // 🔥 Ownership check
  if (product.creatorId !== userId) {
    throw new Error("Not authorized");
  }

  // ✅ Update fields
  Object.assign(product, updateData);

  await product.save();

  return product;
}

export const deleteProductService = async(productId, userId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.creatorId !== userId) {
    throw new Error("Not authorized");
  }

  await product.deleteOne();

  return true;
}