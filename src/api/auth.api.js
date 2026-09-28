import axios from "axios";

const api = axios.create({
    baseURL: `https://feild-proof-backend.onrender.com/api/auth/`,
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

export const logoutUser = async () => {
    try {
        const response = await api.get("/logout");
    } catch (error) {
        throw error.response.message;
    }
}