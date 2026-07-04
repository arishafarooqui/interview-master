const mongoose = require("mongoose")

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    selfDescription: {
        type: String,
    },
    resume: {
        type: String,
    },
    resumeText: {
        type: String,
    },
    report: {
        matchScore: {
            type: Number,
            default: 0
        },
        technicalQuestions: [{
            question: String,
            answer: String,
            topic: String
        }],
        behavioralQuestions: [{
            question: String,
            answer: String,
        }],
        skillGaps: [{
            skill: String,
            severity: {
                type: String,
                enum: ["low", "medium", "high", "medium-low", "medium-high"]
            },
            description: String,
        }],
        preparationPlan: [{
            day: Number,
            focus: String,
            tasks: [String]
        }]
    }
}, { timestamps: true })

const interviewModel = mongoose.model("Interview", interviewSchema)
module.exports = interviewModel