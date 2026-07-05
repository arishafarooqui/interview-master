const puppeteer = require("puppeteer")
const interviewModel = require("../models/interview.model")

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

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

        const prompt = `
        You are a professional resume writer working across ALL industries and fields (technology, medicine,
        sales, education, finance, marketing, HR, hospitality, etc.). Rewrite and improve the candidate's
        ACTUAL resume below so it presents them as strongly and relevantly as possible for the given job
        description.

        STRICT RULES — DO NOT VIOLATE THESE:
        1. Use ONLY real information from "Candidate's Original Resume" below. Do NOT invent, assume, or add
           ANY skill, tool, technology, certification, employer, project, degree, or achievement that is not
           explicitly present in the original resume text or self description.
        2. Detect the candidate's actual field/industry from their resume (e.g. medicine, sales, software
           development, teaching, design, etc.) and create skill category names that make sense for THAT
           field. Do NOT use generic tech categories like "Frontend"/"Backend" unless the candidate is
           actually a software developer. For example: a doctor might have "Clinical Skills" and
           "Certifications"; a sales person might have "Sales Tools" and "Soft Skills"; a developer might
           have "Frontend", "Backend", "Tools".
        3. If the candidate's background does not perfectly match the job description, do NOT fabricate
           missing skills. Instead, rephrase and reorder their REAL experience and skills to emphasize
           whatever is genuinely transferable and relevant to the job. Frame the professional summary to
           confidently connect their real background to the job's needs wherever a genuine connection exists.
        4. You may rephrase, reorder, and tighten bullet points for clarity and impact — every fact must
           trace back to the original resume text.
        5. If a field (phone, LinkedIn, GitHub) is not present anywhere in the original resume, return an
           empty string "" for it instead of making one up.
        6. If there is a clear gap between the candidate's real skills and the job requirements, you may add
           a "growthAreas" array: 1-3 short, honest, forward-looking statements naming what the candidate is
           actively developing toward the role (e.g. "Actively building expertise in Unity and game physics
           to transition into game development"). Never imply the candidate already has a skill they don't.
           Omit "growthAreas" (empty array) if there's no meaningful gap worth mentioning.

        Candidate's Original Resume (raw extracted text):
        """
        ${resumeText}
        """

        Candidate Self Description (extra context, may be empty): ${selfDescription || "Not provided"}
        Target Job Description: ${jobDescription}

        Return ONLY a JSON object in this exact shape (no markdown, no backticks, no extra text):
        {
            "name": "Candidate's real name from the resume",
            "email": "real email from the resume, else ''",
            "phone": "real phone from the resume, else ''",
            "linkedin": "real linkedin url from the resume, else ''",
            "github": "real github url from the resume, else ''",
            "summary": "2-3 sentence professional summary based ONLY on the candidate's real background, tailored to the job",
            "skillCategories": [
                { "category": "Appropriate category name for this candidate's actual field", "skills": ["only real skills belonging to this category from the resume"] }
            ],
            "growthAreas": ["optional: 1-3 honest forward-looking statements, or empty array"],
            "experience": [
                { "company": "real company/organization name from resume", "role": "real job title/role from resume", "duration": "real duration from resume", "points": ["rewritten/improved bullet based on a REAL achievement from the resume"] }
            ],
            "projects": [
                { "name": "real project/case-study/initiative name from resume, if applicable to this field", "tech": "real tools/tech/methods used, from resume", "points": ["rewritten/improved bullet based on real details"] }
            ],
            "education": [
                { "degree": "real degree/qualification from resume", "institute": "real institute from resume", "year": "real year range from resume" }
            ]
        }
        Rules for arrays:
        - "skillCategories": create 2-4 categories max, only with real skills. Skip a category entirely if the candidate has no real skills for it.
        - If the resume has no work experience, return an empty array for "experience".
        - If the resume has no projects/case-studies section, return an empty array for "projects".
        `

        const maxRetries = 2
        let resumeData

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(GROQ_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "user", content: prompt }
                        ],
                        response_format: { type: "json_object" },
                        temperature: 0.6,
                        max_tokens: 4000
                    })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error?.message || "Groq API request failed")
                }

                const text = data.choices[0].message.content
                resumeData = JSON.parse(text)
                break

            } catch (err) {
                console.log(`Resume attempt ${attempt + 1} failed:`, err.message)
                if (attempt === maxRetries) {
                    throw new Error("AI could not generate resume after multiple attempts. Please try again.")
                }
            }
        }

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
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

            ${resumeData.skillCategories && resumeData.skillCategories.length > 0 ? `
            <div class="section">
                <div class="section-title">Skills</div>
                <div class="skills-grid">
                    ${resumeData.skillCategories.map(cat => `
                        <div class="skill-group">
                            <h4>${cat.category}</h4>
                            <div class="skill-tags">
                                ${cat.skills.map(s => `<span class="skill-tag">${s}</span>`).join("")}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
            ` : ""}

            ${resumeData.experience && resumeData.experience.length > 0 ? `
            <div class="section">
                <div class="section-title">Experience</div>
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

            ${resumeData.projects && resumeData.projects.length > 0 ? `
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
            ` : ""}

            ${resumeData.growthAreas && resumeData.growthAreas.length > 0 ? `
            <div class="section">
                <div class="section-title">Growth & Development</div>
                <ul>
                    ${resumeData.growthAreas.map(g => `<li>${g}</li>`).join("")}
                </ul>
            </div>
            ` : ""}

            ${resumeData.education && resumeData.education.length > 0 ? `
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
            ` : ""}
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
        res.setHeader('Content-Disposition', `inline; filename=resume-${id}.pdf`)
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