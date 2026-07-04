const interviewModel = require("../models/interview.model")
const { generateInterviewReport } = require("../services/ai.service")
const fs = require("fs")
const puppeteer = require("puppeteer")
const { PDFParse } = require("pdf-parse")

const normalizeSeverity = (value) => {
    const v = value.toLowerCase()
    if (v.includes("high")) return "high"
    if (v.includes("low")) return "low"
    return "medium"
}

const generateReport = async (req, res) => {
    try {
        const { jobDescription, selfDescription } = req.body
        const userId = req.user.id

        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required"
            })
        }

        let resumeText = ""
        if (req.file) {
            const buffer = fs.readFileSync(req.file.path)
            const parser = new PDFParse({ data: buffer })
            const result = await parser.getText()
            resumeText = result.text
        }

        const report = await generateInterviewReport({
            jobDescription,
            selfDescription,
            resumeText
        })

        report.skillGaps = report.skillGaps.map(gap => ({
            ...gap,
            severity: normalizeSeverity(gap.severity)
        }))

        const interview = await interviewModel.create({
            user: userId,
            jobDescription,
            selfDescription,
            resume: req.file?.path || "",
            resumeText,
            report
        })

        res.status(201).json({
            message: "Report generated successfully",
            interview
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Something went wrong",
            error: err.message
        })
    }
}

const getAllReports = async (req, res) => {
    try {
        const userId = req.user.id
        const interviews = await interviewModel
            .find({ user: userId })
            .select("-report")
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: "Reports fetched successfully",
            interviews
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Something went wrong" })
    }
}

const getReportById = async (req, res) => {
    try {
        const { id } = req.params
        const interview = await interviewModel.findById(id)

        if (!interview) {
            return res.status(404).json({ message: "Report not found" })
        }

        res.status(200).json({
            message: "Report fetched successfully",
            interview
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Something went wrong" })
    }
}

const generatePDF = async (req, res) => {
    try {
        const { id } = req.params
        const interview = await interviewModel.findById(id)

        if (!interview) {
            return res.status(404).json({ message: "Report not found" })
        }

        const { report, jobDescription } = interview

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
      
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Arial', sans-serif; }
                body { background: #0F172A; color: #F8FAFC; padding: 40px; }
                
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 30px;
                    border-bottom: 1px solid #334155;
                }
                .header h1 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #F8FAFC;
                    margin-bottom: 8px;
                }
                .header h1 span { color: #3B82F6; }
                .header p { color: #CBD5E1; font-size: 13px; }

                .score-bar {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    margin: 20px 0;
                }
                .score-number {
                    font-size: 48px;
                    font-weight: 800;
                    color: #3B82F6;
                }
                .score-label { color: #CBD5E1; font-size: 14px; }

                .section { margin-bottom: 35px; }
                .section-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #F8FAFC;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #3B82F6;
                }

                .question-item {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                }
                .question-text {
                    font-size: 13px;
                    font-weight: 600;
                    color: #F8FAFC;
                    margin-bottom: 8px;
                }
                .topic-tag {
                    display: inline-block;
                    background: rgba(59,130,246,0.15);
                    color: #3B82F6;
                    padding: 2px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .answer-text {
                    font-size: 12px;
                    color: #CBD5E1;
                    line-height: 1.7;
                }

                .skill-gap-item {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 10px;
                    padding: 12px 16px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .severity-badge {
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    white-space: nowrap;
                }
                .high { background: rgba(239,68,68,0.15); color: #ef4444; }
                .medium { background: rgba(245,158,11,0.15); color: #f59e0b; }
                .low { background: rgba(16,185,129,0.15); color: #10b981; }

                .plan-item {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 10px;
                    display: flex;
                    gap: 16px;
                }
                .day-badge {
                    background: rgba(59,130,246,0.1);
                    border: 2px solid #3B82F6;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-size: 10px;
                    color: #3B82F6;
                    font-weight: 700;
                }
                .day-badge strong { font-size: 16px; }
                .plan-content h4 { font-size: 13px; font-weight: 600; color: #F8FAFC; margin-bottom: 8px; }
                .plan-content ul { list-style: none; }
                .plan-content li { font-size: 12px; color: #CBD5E1; padding-left: 16px; position: relative; margin-bottom: 4px; line-height: 1.5; }
                .plan-content li::before { content: "→"; position: absolute; left: 0; color: #3B82F6; }

                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #334155;
                    color: #475569;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>⚡ Interview <span>Master</span></h1>
                <p>AI-Powered Interview Preparation Report</p>
                <div class="score-bar">
                    <div>
                        <div class="score-number">${report.matchScore || 0}</div>
                        <div class="score-label">Match Score / 100</div>
                    </div>
                </div>
                <p style="color:#CBD5E1; font-size:12px; margin-top:8px;">
                    Job: ${jobDescription.substring(0, 100)}...
                </p>
            </div>

            <div class="section">
                <div class="section-title">Technical Questions (${report.technicalQuestions.length})</div>
                ${report.technicalQuestions.map((q, i) => `
                    <div class="question-item">
                        <div class="topic-tag">${q.topic}</div>
                        <div class="question-text">Q${i + 1}. ${q.question}</div>
                        <div class="answer-text">${q.answer}</div>
                    </div>
                `).join("")}
            </div>

            <div class="section">
                <div class="section-title">Behavioral Questions (${report.behavioralQuestions.length})</div>
                ${report.behavioralQuestions.map((q, i) => `
                    <div class="question-item">
                        <div class="question-text">Q${i + 1}. ${q.question}</div>
                        <div class="answer-text">${q.answer}</div>
                    </div>
                `).join("")}
            </div>

            <div class="section">
                <div class="section-title">Skill Gaps</div>
                ${report.skillGaps.map(gap => `
                    <div class="skill-gap-item">
                        <span class="severity-badge ${gap.severity}">${gap.severity.toUpperCase()}</span>
                        <div>
                            <div style="font-size:13px; font-weight:600; color:#F8FAFC; margin-bottom:4px;">${gap.skill}</div>
                            <div style="font-size:12px; color:#CBD5E1;">${gap.description}</div>
                        </div>
                    </div>
                `).join("")}
            </div>

            <div class="section">
                <div class="section-title">Preparation Plan</div>
                ${report.preparationPlan.map(plan => `
                    <div class="plan-item">
                        <div class="day-badge">
                            <span>DAY</span>
                            <strong>${plan.day}</strong>
                        </div>
                        <div class="plan-content">
                            <h4>${plan.focus}</h4>
                            <ul>
                                ${plan.tasks.map(task => `<li>${task}</li>`).join("")}
                            </ul>
                        </div>
                    </div>
                `).join("")}
            </div>

            <div class="footer">
                Generated by Interview Master • ${new Date().toLocaleDateString()}
            </div>
        </body>
        </html>
        `

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'domcontentloaded' })

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        })

        await browser.close()