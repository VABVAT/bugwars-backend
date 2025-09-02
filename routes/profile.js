const express = require("express");
const router = express.Router({caseSensitive: false, strict: false, mergeParams: false});
const authMiddleware = require("../middleware/jwtauth");
const cors = require("cors");
const prisma = require('../prisma')

require("dotenv").config();

router.use(cors(
    {
        origin: process.env.FRONTEND_BASE_URL,
        credentials: true
    }));

router.get("/", authMiddleware, async (req, res) => {
    const useremail = req.user.email;
    const userInfo = await prisma.users.findUnique({where: {email: useremail}});
    if (!userInfo) {
        res.status(401).send({
            error: "User not found"
        })
    }

    res.status(200).json({
        ...userInfo,
        id: userInfo.id.toString()
    });
})

module.exports = {
    profileRouter: router
}