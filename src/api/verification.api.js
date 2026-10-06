import axios from "axios";
import { API_URL } from "./config.js";

const api = axios.create({
    baseURL: `${API_URL}/api/verify`,
    headers: {
        "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
});

export const verifyCheckInAPI = async (formData) => {
    const response = await api.post("/check-in", formData);
    return response.data;
}

export const verifyCheckOutAPI = async (formData) => {
    const response = await api.post("/check-out", formData);
    return response.data;
}

export const getVerificationStatusAPI = async () => {
    const response = await api.get("/verifications", {
            headers: {
                "Content-Type": "application/json",
            },
        });
    return response.data;
}

export const delVerification = async (verificationId) => {
    const response = await api.delete(`/del-verification/${verificationId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    return response.data;
}