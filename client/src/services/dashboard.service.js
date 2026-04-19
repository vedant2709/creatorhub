import api from "./api";

export const getDashboardStats = async () => {
  try {
    const res = await api.get("/dashboard");
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to load dashboard insights");
  }
};
