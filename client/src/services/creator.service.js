import api from "./api";

/**
 * Creator services for managing products and their assets
 */

export const createProduct = async (productData) => {
  try {
    const res = await api.post("/products", productData);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create product");
  }
};

export const getCreatorProducts = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const res = await api.get("/products/my-products", {
      params: { page, limit }
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to load products");
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const res = await api.put(`/products/${productId}`, productData);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update product");
  }
};

export const togglePublish = async (productId) => {
  try {
    const res = await api.patch(`/products/${productId}/publish`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update status");
  }
};

export const deleteProduct = async (productId) => {
  try {
    const res = await api.delete(`/products/${productId}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete product");
  }
};
