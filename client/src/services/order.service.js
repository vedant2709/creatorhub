import api from "./api";

export const createOrder = async (productId) => {
  console.log("Product id...", productId)
  try {
    const res = await api.post("/orders", { productId });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create order");
  }
};

export const getMyOrders = async () => {
  try {
    const res = await api.get("/orders");
    console.log("Orders", res);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch orders");
  }
};

export const checkPurchaseStatus = async (productId) => {
  try {
    const res = await api.get(`/orders/check/${productId}`);
    return res.data; // { success: true, purchased: true/false }
  } catch (error) {
    // If 401/Unauthorized, they haven't purchased it
    if (error.response?.status === 401) return { purchased: false };
    throw new Error(error.response?.data?.message || "Failed to check purchase status");
  }
};
