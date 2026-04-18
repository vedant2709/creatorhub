import api from "./api";

export const getPublicProducts = async ({ page = 1, limit = 24 } = {}) => {
  try {
    const res = await api.get("/products", {
      params: { page, limit }
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to load products");
  }
};

export const getProductById = async (id) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.response?.status === 404 ? "Product not found" : null) ||
      "Failed to load product";
    throw new Error(message);
  }
};

export const downloadProduct = async (id) => {
  try {
    const res = await api.get(`/products/${id}/download`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to get download link");
  }
};

// Fallback for cases where `/products/:id` is protected on the backend:
// scan public `/products` pages and find the product by `_id`.
export const getPublicProductById = async (id, { limit = 50, maxPages = 10 } = {}) => {
  for (let page = 1; page <= maxPages; page += 1) {
    const data = await getPublicProducts({ page, limit });
    const products = Array.isArray(data?.products) ? data.products : [];
    const found = products.find((p) => String(p?._id || p?.id) === String(id));
    if (found) return { success: true, data: found };
    if (products.length < limit) break;
  }
  throw new Error("Product not found");
};
