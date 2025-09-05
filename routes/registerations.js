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
        origin: true,
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
    const user = await prisma.lab_users.findUnique({where: {username:useremail}})
    if (!user) {
        await prisma.lab_users.create({
            data: {
                username: email.toString(),
                hasStarted: true
            }
        })
        return res.status(200).json({
            error: false,
            message: "User registered successfully"
        })
    }else{
        await prisma.lab_users.update({
            where: { username: req.user.email },
            data:  { hasStarted: true },
        });
    }
    res.status(200).json({
        error: true,
        message: "User has already registered for the competition... See you soon"
    })
})



module.exports = {
    registerRouter: router
}