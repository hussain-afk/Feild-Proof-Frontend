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

export const ApproveVerification = async (verificationId) => {
    const response = await api.post(`/approve-verification/${verificationId}`);
    return response.data;
}

export const RejectVerification = async (verificationId, reason) => {
    console.log("RejectVerification API called with ID:", verificationId, "and reason:", reason);
    try {
        const response = await api.post(`/reject-verification/${verificationId}`, { reason: reason }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Reject API error:", error.response?.data || error);
        throw error;
    }
}

export const getMyApprovedTasks = async () => {
    try {
        const response = await api.get("/approved-verifications", {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Get My Approved Tasks API error:", error.response?.data || error);
        throw error;
    }
}

export const getMyRejectedTasks = async () => {
    try {
        const response = await api.get("/rejected-verifications", {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Get My Rejected Tasks API error:", error.response?.data || error);
        throw error;
    }
}