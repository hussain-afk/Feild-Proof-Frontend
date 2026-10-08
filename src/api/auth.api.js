import axios from "axios";
import { API_URL } from "./config.js";

const api = axios.create({
    baseURL: `${API_URL}/api/auth/`,
    // https://feild-proof-backend.onrender.com
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const registerUser = async (name, email, password) => {
    try {
        const response = await api.post("/register", {
            name,
            email,
            password
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const loginUser = async (email, password) => {
    try {
        const response = await api.post("/login", {
            email,
            password
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const getCurrentUser = async () => {
    try {
        const response = await api.get("/me");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const getAllUsers = async () => {
    try {
        const res = await api.get("/users");
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const updatePaymentMethod = async (userId, paymentData) => {
    console.log("Updating payment method for user:", userId, "with data:", paymentData);
    try {
        const response = await api.put(`/update-payment/${userId}`, paymentData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const updateUserProfile = async (userId, profileData) => {
    try {
        const response = await api.put(`/update-user/${userId}`, profileData,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const sendVerificationCode = async (email) => {
    try {
        const response = await api.post("/send-verification-code", { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const verifyEmailCode = async (email, code) => {
    try {
        const response = await api.post("/verify-email", { email, code });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const logoutUser = async () => {
    try {
        await api.post("/logout");
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const deleteUserByAdmin = async (userId) => {
    try {
        const response = await api.delete(`/delete-user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}