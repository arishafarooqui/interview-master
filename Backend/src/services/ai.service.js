const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

const schemaDescription = `
Return ONLY a valid JSON object with EXACTLY this structure (no markdown, no backticks, no extra text):
{
  "matchScore": <number 0-100>,
  "technicalQuestions": [
    { "question": "string", "answer": "string", "topic": "string" }
  ],
  "behavioralQuestions": [
    { "question": "string", "answer": "string" }
  ],
  "skillGaps": [
    { "skill": "string", "severity": "low" | "medium" | "high", "description": "string" }
  ],
  "preparationPlan": [
    { "day": <number>, "focus": "string", "tasks": ["string", "..."] }
  ]
}
`

const generateInterviewReport = async ({ jobDescription, selfDescription, resumeText }) => {

    const prompt = `
    You are an expert interview coach. Analyze the following and generate a comprehensive interview preparation report.

    Job Description: ${jobDescription}
    Candidate Profile: ${selfDescription || "Not provided"}
    Resume Content: ${resumeText || "Not provided"}

    Generate at least 5 technical questions, 3 behavioral questions, 3 skill gaps, and a day-wise preparation plan.
    Also provide a matchScore between 0-100 based on how well the candidate matches the job description.

    IMPORTANT RULES:
    - Every "answer" field must be 2-4 sentences MAXIMUM. Do not write long paragraphs.
    - Do not repeat the same sentence or phrase multiple times.
    - Be concise and direct in every field.
    - "severity" MUST be exactly one of: "low", "medium", "high" — no other words allowed.

    ${schemaDescription}
    `

    const maxRetries = 2
    let lastError

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
                    temperature: 0.7,
                    max_tokens: 6000
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error?.message || "Groq API request failed")
            }

            const text = data.choices[0].message.content
            const report = JSON.parse(text)
            return report

        } catch (err) {
            lastError = err
            console.log(`Attempt ${attempt + 1} failed:`, err.message)
        }
    }

    throw new Error("AI response could not be parsed after multiple attempts. Please try generating the report again.")
}

module.exports = { generateInterviewReport }