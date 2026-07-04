import axios from "axios"

const API = axios.create({
    baseURL: "https://interview-master-production-4a10.up.railway.app/api/interview",
    withCredentials: true
})

export const generateReportAPI = async (formData) => {
    const response = await API.post("/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
}

export const getAllReportsAPI = async () => {
    const response = await API.get("/all")
    return response.data
}

export const getReportByIdAPI = async (id) => {
    const response = await API.get(`/${id}`)
    return response.data
}