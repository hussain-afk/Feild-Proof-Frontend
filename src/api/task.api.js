import axios from "axios";

const api = axios.create({
    baseURL: "https://feild-proof-backend.vercel.app/api/tasks/",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const createTask = async (taskData) => {
    try {
        const response = await api.post("/create", taskData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getAllTasks = async () => {
    try {
        const response = await api.get("/all");
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteTask = async (taskId) => {
    try {
        const response = await api.delete(`/del-task/${taskId}`);
        // return response.data;
    } catch (error) {
        throw error;
    }
}