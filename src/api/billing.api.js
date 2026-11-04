import axios from "axios";
import { API_URL } from "./config";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const getMySubscription = async () => {
  const response = await api.get("/api/billing/my-subscription");
  return response.data;
};

export const cancelMySubscription = async () => {
  const response = await api.put("/api/billing/cancel-subscription");
  return response.data;
};

export const createCheckoutSession = async (planId) => {
  const response = await api.post("/api/billing/checkout", { planId });
  return response.data;
};