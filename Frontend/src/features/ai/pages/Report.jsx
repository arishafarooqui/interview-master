import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { getReportByIdAPI } from '../services/interview.api'
import './Report.scss'

const Report = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [interview, setInterview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeSection, setActiveSection] = useState("technical")
    const [expandedQ, setExpandedQ] = useState(null)

    useEffect(() => {
        fetchReport()
    }, [])

    const fetchReport = async () => {
        try {
            const data = await getReportByIdAPI(id)
            setInterview(data.interview)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(
                `https://interview-master-production-4a10.up.railway.app/api/interview/pdf/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            window.open(url, '_blank')
        } catch (err) {
            console.log(err)
        }
    }

    const handleGenerateResume = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(
                `https://interview-master-production-4a10.up.railway.app/api/resume/generate/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            window.open(url, '_blank')
        } catch (err) {
            console.log(err)
        }
    }

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading your report...</p>
        </div>
    )

    if (!interview) return (
        <div className="loading-screen">
            <p>Report not found!</p>
        </div>
    )

    const { report } = interview

    const getSeverityColor = (severity) => {
        if (severity === "high") return "#ef4444"
        if (severity === "medium") return "#f59e0b"
        return "#10b981"
    }

    return (
        <div className="report-container">
            <div className="sidebar">
                <p className="sidebar-title">Sections</p>
                <div className="sidebar-links">
                    <button
                        className={activeSection === "technical" ? "active" : ""}
                        onClick={() => setActiveSection("technical")}
                    >
                         Technical Questions
                    </button>
                    <button
                        className={activeSection === "behavioral" ? "active" : ""}
                        onClick={() => setActiveSection("behavioral")}
                    >
                        🧠 Behavioral Questions
                    </button>
                    <button
                        className={activeSection === "roadmap" ? "active" : ""}
                        onClick={() => setActiveSection("roadmap")}
                    >
                        🗺️ Road Map
                    </button>
                </div>

                <div className="score-section">
                    <h3>Match Score</h3>
                    <div
                        className="score-circle"
                        style={{ "--score": report.matchScore || 0 }}
                    >
                        <div className="score-inner">
                            <span className="score-number">
                                {report.matchScore || 0}
                            </span>
                            <span className="score-percent">/ 100</span>
                        </div>
                    </div>
                    <p className="score-label">
                        {(report.matchScore || 0) >= 70
                            ? "Strong match! 🔥"
                            : (report.matchScore || 0) >= 50
                            ? "Good potential! 💪"
                            : "Keep improving! "}
                    </p>
                </div>

                <div className="skill-gaps">
                    <h3>Skill Gaps</h3>
                    {report.skillGaps.map((gap, i) => (
                        <div
                            key={i}
                            className="gap-badge"
                            style={{ borderColor: getSeverityColor(gap.severity) }}
                            title={gap.description}
                        >
                            <span style={{ color: getSeverityColor(gap.severity) }}>
                                {gap.skill}
                            </span>
                            <span
                                className="severity-dot"
                                style={{ background: getSeverityColor(gap.severity) }}
                            ></span>
                        </div>
                    ))}
                </div>

                <button className="pdf-btn" onClick={handleDownloadPDF}>
                     Download Report PDF
                </button>

                <button className="resume-btn" onClick={handleGenerateResume}>
                     Generate Resume PDF
                </button>

                <button className="back-btn" onClick={() => navigate("/home")}>
                    ← Generate New Plan
                </button>
            </div>

            <div className="main-content">
                {activeSection === "technical" && (
                    <div className="section">
                        <h2>Technical Questions <span>{report.technicalQuestions.length} questions</span></h2>
                        {report.technicalQuestions.map((q, i) => (
                            <div
                                key={i}
                                className={`question-card ${expandedQ === i ? "expanded" : ""}`}
                                onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                            >
                                <div className="question-header">
                                    <span className="q-num">Q{i + 1}</span>
                                    <p>{q.question}</p>
                                    <span className="arrow">{expandedQ === i ? "▲" : "▼"}</span>
                                </div>
                                {expandedQ === i && (
                                    <div className="question-answer">
                                        <div className="topic-badge">{q.topic}</div>
                                        <p>{q.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeSection === "behavioral" && (
                    <div className="section">
                        <h2>Behavioral Questions <span>{report.behavioralQuestions.length} questions</span></h2>
                        {report.behavioralQuestions.map((q, i) => (
                            <div
                                key={i}
                                className={`question-card ${expandedQ === `b${i}` ? "expanded" : ""}`}
                                onClick={() => setExpandedQ(expandedQ === `b${i}` ? null : `b${i}`)}
                            >
                                <div className="question-header">
                                    <span className="q-num">Q{i + 1}</span>
                                    <p>{q.question}</p>
                                    <span className="arrow">{expandedQ === `b${i}` ? "▲" : "▼"}</span>
                                </div>
                                {expandedQ === `b${i}` && (
                                    <div className="question-answer">
                                        <p>{q.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeSection === "roadmap" && (
                    <div className="section">
                        <h2>Preparation Road Map</h2>
                        <div className="roadmap">
                            {report.preparationPlan.map((plan, i) => (
                                <div key={i} className="roadmap-item">
                                    <div className="day-circle">
                                        <span>Day</span>
                                        <strong>{plan.day}</strong>
                                    </div>
                                    <div className="roadmap-content">
                                        <h3>{plan.focus}</h3>
                                        <ul>
                                            {plan.tasks.map((task, j) => (
                                                <li key={j}>{task}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Report