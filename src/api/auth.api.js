import axios from "axios";

const api = axios.create({
    baseURL: "https://feild-proof-backend.vercel.app/api/auth",
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
        throw error.response.data;
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
        throw error.response.data;
    }
}

export const getCurrentUser = async () => {
    try {
        const response = await api.get("/me");
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const getAllUsers = async () => {
    try {
        const res = await api.get("/users");
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
}

export const logoutUser = async () => {
    try {
        const response = await api.get("/logout");
    } catch (error) {
        throw error.response.data;
    }
}