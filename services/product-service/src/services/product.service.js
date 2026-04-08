import Product from "../models/product.model.js"

export const createProductService = async (productData) => {
  const product = await Product.create(productData);
  return product;
};