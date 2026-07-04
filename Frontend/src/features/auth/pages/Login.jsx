import React, { useState } from 'react'
import './login.scss'
import useAuth from '../hooks/useAuth'
<div className="auth-box">
    <div className="auth-logo">
        <span> Interview Master</span>
    </div>
    <h1>Welcome back</h1>
    <p className="auth-subtitle">Sign in to continue your interview prep</p>
    </div>
const Login = () => {
    const { login, loading } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await login(formData)
            window.location.href = "/home"
        } catch (err) {
            alert(err.response?.data?.message || "Something went wrong!")
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                    </button>
                </form>
                <p className="switch-link">
                    Don't have an account? <a href="/Register">Register</a>
                </p>
            </div>
        </div>
    )
}

export default Login