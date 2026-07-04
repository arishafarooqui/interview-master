import axios from "axios";

const API = axios.create({
    baseURL: "https://interview-master-production-4a10.up.railway.app/api/auth",
    withCredentials: true
});

// ✅ added: har request ke saath token header mein bhej do (agar exist kare)
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const registerAPI = async (userData) => {
    const response = await API.post("/register", userData);
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);   // ✅ added
    }
    return response.data;
};

export const loginAPI = async (userData) => {
    const response = await API.post("/login", userData);
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);   // ✅ added
    }
    return response.data;
};

export const logoutAPI = async () => {
    const response = await API.get("/logout");
    localStorage.removeItem("token");   // ✅ added
    return response.data;
};

export const getProfileAPI = async () => {
    const response = await API.get("/get-me");
    return response.data;
};