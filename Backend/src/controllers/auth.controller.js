const userModel = require('../models/user.model')
const blacklistModel = require('../models/blacklist.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const cookieOptions = {
    httpOnly: true,
    secure: true,        // sirf HTTPS pe cookie bheji jaye
    sameSite: "none",    // cross-site (Vercel <-> Railway) allow kare
}

/**
 * @description Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const registerUserController = async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(409).json({
            message: "User already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET)

    res.cookie("token", token, cookieOptions)

    res.status(201).json({
        message: "User created successfully",
        user
    })
}

/**
 * @description Login user
 * @route POST /api/auth/login
 * @access Public
 */
const loginUserController = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: "Please provide email and password"
        })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET)

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        message: "Login successful",
        user
    })
}

/**
 * @description Logout user
 * @route GET /api/auth/logout
 * @access Private
 */
const logoutUserController = async (req, res) => {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "You are not logged in"
        })
    }

    await blacklistModel.create({ token })

    res.clearCookie("token", cookieOptions)

    res.status(200).json({
        message: "Logout successful"
    })
}

const getProfileController = async (req, res) => {
    const user = await userModel.findById(req.user.id).select("-password")

    res.status(200).json({
        message: "Profile fetched successfully",
        user
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getProfileController
}