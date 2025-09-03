const express = require("express");
const router = express.Router({caseSensitive: false, strict: false, mergeParams: false});
require("dotenv").config();
const axios = require("axios");
const prisma = require('../prisma')
const jwt = require('jsonwebtoken');
const authMiddleware = require("../middleware/jwtauth");
const cors = require("cors");


router.use(cors(
    {
        origin: process.env.FRONTEND_BASE_URL,
        credentials: true
    }));

router.post("/", authMiddleware, async (req, res) => {
    const useremail = req.user.email;

    if (!useremail) {
        res.status(401).json({
            error: true,
            message: "Invalid email or password"
        })
        return;
    }
    const email = useremail;
    const user = await prisma.test_lab.findUnique({where: {email:useremail}})
    if (!user) {
        await prisma.test_lab.create({
            data: {
                email: email.toString(),
                completed: false
            }
        })
        res.status(200).json({
            error: false,
            message: "User registered successfully"
        })
    }
    res.status(200).json({
        error: true,
        message: "User has already registered for the competition... See you soon"
    })
})

module.exports = {
    registerRouter: router
}