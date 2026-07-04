import { createContext, useContext, useState } from "react"
import { loginAPI, registerAPI, logoutAPI, getProfileAPI } from "../features/auth/services/auth.api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const register = async (userData) => {
        setLoading(true)
        try {
            const data = await registerAPI(userData)
            setUser(data.user)
            setError(null)
            return data
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
            throw err
        } finally {
            setLoading(false)
        }
    }

    const login = async (userData) => {
        setLoading(true)
        try {
            const data = await loginAPI(userData)
            setUser(data.user)
            setError(null)
            return data
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        setLoading(true)
        try {
            await logoutAPI()
            setUser(null)
            setError(null)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
            throw err
        } finally {
            setLoading(false)
        }
    }

    const getProfile = async () => {
        setLoading(true)
        try {
            const data = await getProfileAPI()
            setUser(data.user)
            setError(null)
            return data
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
            throw err
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, error, register, login, logout, getProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)