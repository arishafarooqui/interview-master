const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const interviewReportSchema = {
    type: SchemaType.OBJECT,
    properties: {
        matchScore: {
            type: SchemaType.NUMBER,
        },
        technicalQuestions: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: { type: SchemaType.STRING },
                    answer: { type: SchemaType.STRING },
                    topic: { type: SchemaType.STRING }
                },
                required: ["question", "answer", "topic"]
            }
        },
        behavioralQuestions: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: { type: SchemaType.STRING },
                    answer: { type: SchemaType.STRING }
                },
                required: ["question", "answer"]
            }
        },
        skillGaps: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    skill: { type: SchemaType.STRING },
                    severity: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING }
                },
                required: ["skill", "severity", "description"]
            }
        },
        preparationPlan: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    day: { type: SchemaType.NUMBER },
                    focus: { type: SchemaType.STRING },
                    tasks: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING }
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
}

const generateInterviewReport = async ({ jobDescription, selfDescription, resumeText }) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema,
            maxOutputTokens: 8192,
            temperature: 0.8,
        }
    })

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
    `

    const maxRetries = 2
    let lastError

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt)
            const response = result.response.text()
            const report = JSON.parse(response)
            return report
        } catch (err) {
            lastError = err
            console.log(`Attempt ${attempt + 1} failed:`, err.message)
        }
    }

    throw new Error("AI response could not be parsed after multiple attempts. Please try generating the report again.")
}

module.exports = { generateInterviewReport }