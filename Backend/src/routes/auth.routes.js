const { Router } = require('express')
const { registerUserController, loginUserController, logoutUserController, getProfileController } = require('../controllers/auth.controller')
const { isAuthenticated } = require('../middlewares/auth.middleware')

const authRouter = Router()  // ✅ pehle define karo

authRouter.post("/register", registerUserController)
authRouter.post("/login", loginUserController)
authRouter.get("/logout", isAuthenticated, logoutUserController)
authRouter.get("/get-me", isAuthenticated, getProfileController)  // ✅ phir use karo

module.exports = authRouter