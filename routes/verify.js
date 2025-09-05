const express = require("express");
const router = express.Router({caseSensitive: false, strict: false, mergeParams: false});
const authMiddleware = require("../middleware/jwtauth");
const cors = require("cors");
const prisma = require('../prisma')

require("dotenv").config();

router.use(cors(
    {
        origin: true,
        credentials: true
    }));


router.post("/", authMiddleware, async (req, res) => {
    const {lab} = req.query;
    console.log(req.query);
    const body = req.body;
    const answer = body.answer;
    const user = await prisma.lab_users.findUnique({where: {username: req.user.email}})
    if(!user || !user.hasStarted === true) {
        return res.status(400).json({ error: "Start the lab before attempting to answer" });
    }
    if (!lab || !answer) {
        return res.status(400).json({ error: "Incorrect answer" });
    }
    let position = -1;
    const lastFinishedUser = await prisma.lab_users.findFirst({
        where: { finished_at: { not: null }, hasFinished: true, finishPosition: { not: null}, username: {not: req.user.email} },
        orderBy: { finished_at: "desc" },
    });
    if(!lastFinishedUser){
        position = 1;
    }else{
        position =  lastFinishedUser.finishPosition + 1;
    }
    if(answer === "merejaisebhondukeliyeyeduniyanahibaniplshelp"){
        await prisma.lab_users.update({
            where: { username: req.user.email },              // must be UNIQUE (e.g., id, email, etc.)
            data:  { hasFinished: true, finished_at: new Date().toISOString(), finishPosition: position },
        })
        return res.status(200).json({
            success: true
        })
    }
    return res.status(200).json({
        success: false
    })
})

router.get("/stats", authMiddleware, async (req, res) => {
    const {lab} = req.query;

    if (!lab) {
        return res.status(400).json({ error: "Missing or invalid 'lab' query param" });
    }
    let user = await prisma.lab_users.findUnique({
        where: {username: req.user.email},
    })

        if (!user) {
            user = await prisma.lab_users.create({
                data: {
                    username: req.user.email.toString(),
                    hasStarted: false
                }
            })
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
        Finished: result2.length,
        hasFinished: user.hasFinished,
        finishingPosition: user.finishPosition
    })
})

module.exports = {
    verifyRouter: router
}