import { createBrowserRouter, Navigate } from "react-router"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Home from "./features/ai/pages/Home"
import Report from "./features/ai/pages/Report"
import ProtectedRoute from "./components/ProtectedRoute"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/Login" />
    },
    {
        path: "/Login",
        element: <Login />
    },
    {
        path: "/Register",
        element: <Register />
    },
    {
        path: "/home",
        element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        )
    },
    {
        path: "/report/:id",
        element: (
            <ProtectedRoute>
                <Report />
            </ProtectedRoute>
        )
    }
])