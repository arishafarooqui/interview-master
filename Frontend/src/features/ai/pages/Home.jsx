import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { generateReportAPI } from '../services/interview.api'
import './Home.scss'
<div className="home-header">
    <div className="header-badge"> AI POWERED</div>
    <h1>Create Your Custom <span>Interview Plan</span></h1>
    <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
</div>
const Home = () => {
    const navigate = useNavigate()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [resume, setResume] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!jobDescription) {
            setError("Job description is required!")
            return
        }
        if (!selfDescription && !resume) {
            setError("Please provide either a resume or self description!")
            return
        }

        setLoading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("jobDescription", jobDescription)
            formData.append("selfDescription", selfDescription)
            if (resume) formData.append("resume", resume)

            const data = await generateReportAPI(formData)
            navigate(`/report/${data.interview._id}`)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="home-container">
            <div className="home-header">
                <h1>Create Your Custom <span>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </div>

            <form onSubmit={handleSubmit} className="home-form">
                <div className="form-left">
                    <div className="form-card">
                        <div className="card-header">
                            <span> </span>
                            <h3>Target Job Description</h3>
                            <span className="badge required">REQUIRED</span>
                        </div>
                        <textarea
                            placeholder="Paste the full job description here...
e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={10}
                        />
                    </div>
                </div>

                <div className="form-right">
                    <div className="form-card">
                        <div className="card-header">
                            <span> </span>
                            <h3>Your Profile</h3>
                        </div>

                        <div className="upload-section">
                            <label className="upload-label">
                                Upload Resume
                                <span className="badge best">BEST RESULTS</span>
                            </label>
                            <div
                                className="upload-box"
                                onClick={() => document.getElementById('resumeInput').click()}
                            >
                                <span className="upload-icon">☁️</span>
                                <p>{resume ? resume.name : "Click to upload or drag & drop"}</p>
                                <span className="upload-sub">PDF or DOCX (Max 5MB)</span>
                                <input
                                    id="resumeInput"
                                    type="file"
                                    accept=".pdf"
                                    style={{ display: "none" }}
                                    onChange={(e) => setResume(e.target.files[0])}
                                />
                            </div>
                        </div>

                        <div className="divider">OR</div>

                        <div className="self-desc">
                            <label>Quick Self-Description</label>
                            <textarea
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                </div>
            </form>

            {error && <p className="error-msg">{error}</p>}

            <div className="info-msg">
                <span>ℹ</span>
                <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
            </div>

            <button
                className="generate-btn"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Generating..." : " Generate My Interview Plan"}
            </button>
        </div>
    )
}

export default Home