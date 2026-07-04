const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const resumeRouter = require("./routes/resume.routes")
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/resume", resumeRouter)
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app