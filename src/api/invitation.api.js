import axios from "axios";
import { API_URL } from "./config.js";

const api = axios.create({
    baseURL: `${API_URL}/api/invitations/`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const getWorkerInvitations = async () => {
    try {
        const res = await api.get("/worker-invitations");
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const getManagerInvitations = async () => {
    try {
        const res = await api.get("/manager-invitations");
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const inviteWorker = async (workerId) => {
    try {
        const res = await api.post("/invite", { workerId });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const acceptInvite = async (invitationId) => {
    try {
        const res = await api.post("/accept-invite",{ invitationId });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}

export const rejectInvite = async (invitationId) => {
    try {
        const res = await api.post("/reject-invite",{ invitationId });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
}