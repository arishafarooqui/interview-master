const puppeteer = require("puppeteer")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const interviewModel = require("../models/interview.model")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const generateResumePDF = async (req, res) => {
    try {
        const { id } = req.params
        const interview = await interviewModel.findById(id)

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" })
        }

        const { jobDescription, selfDescription, resumeText, report } = interview

        if (!resumeText) {
            return res.status(400).json({
                message: "No resume was uploaded for this interview, so a tailored resume can't be generated."
            })
        }

        // AI se resume content generate karo
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        })

        const prompt = `
        You are a professional resume writer. Rewrite and improve the candidate's ACTUAL resume below so it is
        better tailored to the given job description. Do NOT invent a different person, company, project, or
        history. Use ONLY the real information found in "Candidate's Original Resume". You may rephrase,
        reorder, tighten bullet points, and emphasize skills/experience that are relevant to the job description,
        but every name, employer, project, degree, and date must come from the original resume text. If a field
        (e.g. phone or LinkedIn) is not present anywhere in the original resume, return an empty string "" for it
        instead of making one up.

        Candidate's Original Resume (raw extracted text):
        """
        ${resumeText}
        """

        Candidate Self Description (extra context, may be empty): ${selfDescription || "Not provided"}
        Target Job Description: ${jobDescription}
        Skill Gaps Identified Earlier (for context only, do not fabricate experience to cover these): ${report.skillGaps.map(g => g.skill).join(", ") || "None"}

        Return ONLY a JSON object:
        {
            "name": "Candidate's real name from the resume",
            "email": "real email from the resume, else ''",
            "phone": "real phone from the resume, else ''",
            "linkedin": "real linkedin url from the resume, else ''",
            "github": "real github url from the resume, else ''",
            "summary": "2-3 sentence professional summary based on the candidate's real background, tailored to the job",
            "skills": {
                "frontend": ["only real skills from the resume"],
                "backend": ["only real skills from the resume"],
                "tools": ["only real skills from the resume"]
            },
            "experience": [
                {
                    "company": "real company name from resume",
                    "role": "real job title from resume",
                    "duration": "real duration from resume",
                    "points": ["rewritten/improved bullet based on a real achievement", "..."]
                }
            ],
            "projects": [
                {
                    "name": "real project name from resume",
                    "tech": "real tech stack from resume",
                    "points": ["rewritten/improved bullet based on real project details"]
                }
            ],
            "education": [
                {
                    "degree": "real degree from resume",
                    "institute": "real institute from resume",
                    "year": "real year range from resume"
                }
            ]
        }
        If the resume has no work experience, return an empty array for "experience" instead of inventing one.
        Return ONLY JSON, no markdown, no backticks.
        `

        const result = await model.generateContent(prompt)
        const response = result.response.text()
        const clean = response.replace(/```json|```/g, "").trim()
        const resumeData = JSON.parse(clean)

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                     font-family: Arial, sans-serif;
                    background: #fff;
                    color: #111827;
                    width: 210mm;
                    padding: 12mm 14mm;
                    font-size: 11px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #1E3A8A;
                }
                .header-left h1 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #1E3A8A;
                }
                .header-right {
                    text-align: right;
                    font-size: 10px;
                    color: #6B7280;
                    line-height: 1.8;
                }
                .header-right a { color: #2563EB; text-decoration: none; }
                .section { margin-bottom: 10px; }
                .section-title {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #1E3A8A;
                    border-bottom: 1px solid #E2E8F0;
                    padding-bottom: 3px;
                    margin-bottom: 6px;
                }
                .summary {
                    font-size: 10.5px;
                    color: #374151;
                    line-height: 1.6;
                }
                .skills-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 8px;
                }
                .skill-group h4 {
                    font-size: 10px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 3px;
                }
                .skill-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 3px;
                }
                .skill-tag {
                    background: #EFF6FF;
                    color: #1E40AF;
                    padding: 2px 7px;
                    border-radius: 4px;
                    font-size: 9.5px;
                    font-weight: 500;
                }
                .exp-item, .proj-item { margin-bottom: 7px; }
                .exp-header, .proj-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 2px;
                }
                .exp-company, .proj-name {
                    font-size: 11px;
                    font-weight: 700;
                    color: #111827;
                }
                .exp-duration, .proj-tech {
                    font-size: 9.5px;
                    color: #6B7280;
                }
                .exp-role {
                    font-size: 10px;
                    color: #2563EB;
                    font-weight: 500;
                    margin-bottom: 3px;
                }
                ul { list-style: none; }
                ul li {
                    font-size: 10px;
                    color: #374151;
                    padding-left: 12px;
                    position: relative;
                    margin-bottom: 2px;
                    line-height: 1.5;
                }
                ul li::before {
                    content: "▸";
                    position: absolute;
                    left: 0;
                    color: #2563EB;
                }
                .edu-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                }
                .edu-left .edu-degree {
                    font-size: 10.5px;
                    font-weight: 600;
                    color: #111827;
                }
                .edu-left .edu-institute {
                    font-size: 10px;
                    color: #6B7280;
                }
                .edu-year {
                    font-size: 10px;
                    color: #6B7280;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="header-left">
                    <h1>${resumeData.name}</h1>
                </div>
                <div class="header-right">
                    ${resumeData.email ? `<div>${resumeData.email}</div>` : ""}
                    ${resumeData.phone ? `<div>${resumeData.phone}</div>` : ""}
                    ${resumeData.linkedin ? `<div><a href="${resumeData.linkedin}">LinkedIn</a></div>` : ""}
                    ${resumeData.github ? `<div><a href="${resumeData.github}">GitHub</a></div>` : ""}
                </div>
            </div>

            <div class="section">
                <div class="section-title">Professional Summary</div>
                <p class="summary">${resumeData.summary}</p>
            </div>

            <div class="section">
                <div class="section-title">Technical Skills</div>
                <div class="skills-grid">
                    <div class="skill-group">
                        <h4>Frontend</h4>
                        <div class="skill-tags">
                            ${resumeData.skills.frontend.map(s => `<span class="skill-tag">${s}</span>`).join("")}
                        </div>
                    </div>
                    <div class="skill-group">
                        <h4>Backend & Database</h4>
                        <div class="skill-tags">
                            ${resumeData.skills.backend.map(s => `<span class="skill-tag">${s}</span>`).join("")}
                        </div>
                    </div>
                    <div class="skill-group">
                        <h4>Tools & DevOps</h4>
                        <div class="skill-tags">
                            ${resumeData.skills.tools.map(s => `<span class="skill-tag">${s}</span>`).join("")}
                        </div>
                    </div>
                </div>
            </div>

            ${resumeData.experience.length > 0 ? `
            <div class="section">
                <div class="section-title">Work Experience</div>
                ${resumeData.experience.map(exp => `
                    <div class="exp-item">
                        <div class="exp-header">
                            <span class="exp-company">${exp.company}</span>
                            <span class="exp-duration">${exp.duration}</span>
                        </div>
                        <div class="exp-role">${exp.role}</div>
                        <ul>
                            ${exp.points.map(p => `<li>${p}</li>`).join("")}
                        </ul>
                    </div>
                `).join("")}
            </div>
            ` : ""}

            <div class="section">
                <div class="section-title">Projects</div>
                ${resumeData.projects.map(proj => `
                    <div class="proj-item">
                        <div class="proj-header">
                            <span class="proj-name">${proj.name}</span>
                            <span class="proj-tech">${proj.tech}</span>
                        </div>
                        <ul>
                            ${proj.points.map(p => `<li>${p}</li>`).join("")}
                        </ul>
                    </div>
                `).join("")}
            </div>

            <div class="section">
                <div class="section-title">Education</div>
                ${resumeData.education.map(edu => `
                    <div class="edu-item">
                        <div class="edu-left">
                            <div class="edu-degree">${edu.degree}</div>
                            <div class="edu-institute">${edu.institute}</div>
                        </div>
                        <div class="edu-year">${edu.year}</div>
                    </div>
                `).join("")}
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
            pageRanges: '1'
        })
        await browser.close()

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=resume-${id}.pdf`)
        res.send(pdf)

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Resume generation failed",
            error: err.message
        })
    }
}

module.exports = { generateResumePDF }