const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

const app = express()

const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(cors({
    origin: ['http://localhost:5173', 'https://interview-master-xi.vercel.app'],
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())

const resumeRouter = require("./routes/resume.routes")
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/resume", resumeRouter)
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app