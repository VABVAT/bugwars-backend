const express = require("express");
const router = express.Router({caseSensitive: false, strict: false, mergeParams: false});
const authMiddleware = require("../middleware/jwtauth");
const cors = require("cors");
const prisma = require('../prisma')

require("dotenv").config();

router.use(cors(
    {
        origin: process.env.ENVIROMENT === "dev" ? process.env.FRONTEND_BASE_URL : process.env.FRONTEND_PROD_URL,
        credentials: true
    }));

router.post("/", authMiddleware, async (req, res) => {
    const {lab} = req.query;
    console.log(req.query);
    const body = req.body;
    const answer = body.answer;
    if (!lab || !answer) {
        return res.status(400).json({ error: "Missing or invalid 'lab' query param" });
    }
    if(answer === "merejaisebhondukeliyeyeduniyanahibaniplshelp"){
        await prisma.lab_users.update({
            where: { username: req.user.email },              // must be UNIQUE (e.g., id, email, etc.)
            data:  { hasFinished: true },
        });
        return res.status(200).json({
            success: true
        })
    }
    return res.status(200).json({
        success: false
    })
})

router.get("/stats", async (req, res) => {
    const {lab} = req.query;
    if (!lab) {
        return res.status(400).json({ error: "Missing or invalid 'lab' query param" });
    }
    const result = await prisma.lab_users.findMany({
        where: {
            hasStarted: true
        }
    });
    const result2 = await prisma.lab_users.findMany({
        where: {
            hasFinished: true
        }
    });

    return res.status(200).json({
        Started: result.length,
        Finished: result2.length
    })
})

module.exports = {
    verifyRouter: router
}