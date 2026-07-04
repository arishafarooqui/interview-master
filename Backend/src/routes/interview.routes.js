const { Router } = require("express")
const { generateReport, getAllReports, getReportById, generatePDF } = require("../controllers/interview.controller")
const { isAuthenticated } = require("../middlewares/auth.middleware")
const multer = require("multer")
const path = require("path")

const uploadsPath = path.join(__dirname, "..", "uploads")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsPath)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true)
        } else {
            cb(new Error("Only PDF files allowed!"), false)
        }
    }
})

const interviewRouter = Router()

/**
 * @route POST /api/interview/generate
 * @description Generate interview report
 * @access Private
 */
interviewRouter.post("/generate", isAuthenticated, upload.single("resume"), generateReport)

/**
 * @route GET /api/interview/all
 * @description Get all reports
 * @access Private
 */
interviewRouter.get("/all", isAuthenticated, getAllReports)

/**
 * @route GET /api/interview/pdf/:id
 * @description Generate PDF
 * @access Private
 */
interviewRouter.get("/pdf/:id", isAuthenticated, generatePDF)

/**
 * @route GET /api/interview/:id
 * @description Get report by id
 * @access Private
 */
interviewRouter.get("/:id", isAuthenticated, getReportById)

module.exports = interviewRouter