const { Router } = require("express")
const { generateResumePDF } = require("../controllers/resume.controller")
const { isAuthenticated } = require("../middlewares/auth.middleware")

const resumeRouter = Router()

resumeRouter.get("/generate/:id", isAuthenticated, generateResumePDF)

module.exports = resumeRouter