import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials: true  // cookies ke liye
});

// Register
export const registerAPI = async (userData) => {
    const response = await API.post("/register", userData);
    return response.data;
};

// Login
export const loginAPI = async (userData) => {
    const response = await API.post("/login", userData);
    return response.data;
};

// Logout
export const logoutAPI = async () => {
    const response = await API.get("/logout");
    return response.data;
};

// Get Profile
export const getProfileAPI = async () => {
    const response = await API.get("/get-me");
    return response.data;
};