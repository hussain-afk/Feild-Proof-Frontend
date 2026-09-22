import axios from "axios";

const api = axios.create({
    baseURL: `https://feild-proof-backend.onrender.com/api/verify`,
    headers: {
        "Content-Type": "multipart/form-data",
      },
    withCredentials: true,
});

export const verifyCheckInAPI = async (formData) => {
    try {
        const response = await api.post("/check-in", formData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const verifyCheckOutAPI = async (formData) => {
    try {
        const response = await api.post("/check-out", formData);
        return response.data;
    } catch (error) {
        throw error;
    }
}