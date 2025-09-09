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
    const {lab} = req.query;
    console.log(req.query);
    const Lab = Number(lab);
    if (!lab || Number.isNaN(Lab) || Lab <= 0) {
        return res.status(400).json({error: "'lab' must be a positive integer"});
    }

    const useremail = req.user.email;

    if (!useremail) {
        res.status(401).json({
            error: true,
            message: "Invalid email or password"
        })
        return;
    }
    const user = await prisma.lab_users.findUnique({
        where: {
            username_labId: {
                username: useremail,
                labId: Lab,
            },
        },
    });
    console.log(user);
    if (!user) {
        await prisma.lab_users.create(
            {
                data: {
                    username: useremail,
                    labId: Lab,
                    hasStarted: false,
                }
            })
    }else{
        return res.status(200).json({
            error: false,
            message: "User has already registered for the competition... See you soon"
        })
    }

    return res.status(200).json({
        error: false,
        message: "Registration successful"
    })
})


// todo this has to be correct entirely
router.post("/start", authMiddleware, async (req, res) => {
    const useremail = req.user.email;
    const labNumber = req.body.lab

    if (!useremail) {
        res.status(401).json({
            error: true,
            message: "Invalid email or password"
        })
        return;
    }
    const user = await prisma.lab_users.findUnique({
        where: {
            username_labId: {
                username: useremail,
                labId: labNumber,
            },
        },
    });
    if (!user) {
        return res.status(400).json({
            error: true,
            message: "You did not register on time"
        })
    } else {
        await prisma.lab_users.update({
            where: {
                username_labId: {
                    username: req.user.email,
                    labId: labNumber,
                },
            },
            data: {
                hasStarted: true,
            },
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