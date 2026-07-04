import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import useAuth from "../features/auth/hooks/useAuth"

const ProtectedRoute = ({ children }) => {
    const { user, getProfile } = useAuth()
    const navigate = useNavigate()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        const check = async () => {
            try {
                await getProfile()
            } catch {
                navigate("/Login")
            } finally {
                setChecking(false)
            }
        }
        check()
    }, [])

    if (checking) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#0f0f1a",
                color: "#6366f1"
            }}>
                <div style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid #2a2a4a",
                    borderTop: "3px solid #6366f1",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                }}/>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
        )
    }

    if (!user) return null

    return children
}

export default ProtectedRoute