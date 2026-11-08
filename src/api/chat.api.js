import axios from "axios";
import { API_URL } from "./config.js";

const api = axios.create({
  baseURL: `${API_URL}/api/chat`,
  // Content-Type yahan set mat karo:
  //  - plain object  -> axios khud application/json lagata hai
  //  - FormData      -> browser khud multipart/form-data + boundary lagata hai
  withCredentials: true,
});

export const getMessages = async (otherUserId) => {
  try {
    const response = await api.get(`/${otherUserId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw error;
  }
};

export const sendMessage = async (toUserId, text, file = null) => {
  const formData = new FormData();
  formData.append("toUserId", toUserId);
  formData.append("text", text || "");

  if (file) {
    formData.append("mediaFile", file); // naam route ke upload.single("mediaFile") se match hona chahiye
  }

  const response = await api.post("/send", formData);
  return response.data;
};