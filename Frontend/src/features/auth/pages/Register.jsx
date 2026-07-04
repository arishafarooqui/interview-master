import React, { useState } from 'react'
import './register.scss'
import useAuth from '../hooks/useAuth'
<div className="auth-box">
    <div className="auth-logo">
        <span>⚡ Interview Master</span>
    </div>
    <h1>Create account</h1>
    <p className="auth-subtitle">Start your interview preparation journey</p>
    </div>
const Register = () => {
    const { register, loading } = useAuth()

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await register(formData)
            window.location.href = "/Login"
        } catch (err) {
            alert(err.response?.data?.message || "Something went wrong!")
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Enter username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>
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
                        {loading ? "Loading..." : "Register"}
                    </button>
                </form>
                <p className="switch-link">
                    Already have an account? <a href="/Login">Login</a>
                </p>
            </div>
        </div>
    )
}

export default Register