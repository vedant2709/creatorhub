import api from "./api";

export const createRazorpayOrder = async (orderId) => {
  try {
    const res = await api.post("/payments/create", { orderId });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to initiate payment");
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const res = await api.post("/payments/verify", paymentData);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Payment verification failed");
  }
};
