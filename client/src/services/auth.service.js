import api from "./api";

export const registerUser = async(data) => {
    try {
        const res = await api.post("/auth/register", data);
        return res.data;
    } catch (error) {
        console.log("Error...",error)
        throw new Error(
            error.response?.data?.message || "Register failed"
        )
    }
}

export const loginUser = async (data) => {
    try {
        const res = await api.post("/auth/login", data);
        return res.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Login failed"
        )
    }
}

export const logoutUser = async () => {
    try {
        const res = await api.post("/auth/logout");
        return res.data;
    } catch (error) {
        throw new Error("Logout failed");
    }
}

export const getMe = async() => {
    try {
        const res = await api.get("/auth/me");
        return res.data;
    } catch (error) {
        throw new Error("Not authenticated");
    }
}

export const refreshToken = async() => {
    const res = await api.post("/auth/refresh-token");
    return res.data;
}