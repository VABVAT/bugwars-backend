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


router.post("/set-nickname", authMiddleware , async (req, res) => {
        const name = req.body.nickname;
        const email = req.user.email;
        const user = await prisma.users.findUnique({
            where: {
                email: email
            }
        })
    if (!user) {
        return res.status(401).json({
            error: "User not found"
        })
    }
    if (user.nickName && user.nickName === name) {
        return res.status(200).json({ success: true, message: "Nickname unchanged.", name });
    }

    const existing = await prisma.users.findFirst({
        where: {
            nickName: name,
            // exclude current user (in case nickName is same for current user)
            NOT: { email: email },
        },
    });

    if (existing) {
        return res
            .status(409)
            .json({ success: false, message: "Nickname already taken. Please choose another." });
    }

    await prisma.users.update({
        where: {email},
        data: {nickName: name},
    })

    return res.status(200).json({ success: true, message: "Nickname set." });
})


router.post("/", authMiddleware, async (req, res) => {
    const {lab} = req.query
    const Lab = Number(lab);
    if (!lab || Number.isNaN(Lab) || Lab <= 0) {
        return res.status(400).json({error: "'lab' must be a positive integer"});
    }
    const body = req.body;
    const answer = body.answer;
    const user = await prisma.lab_users.findUnique({where: {                    username_labId: {
                username: req.user.email,
                labId: Lab,
            }}})
    if (!user || !user.hasStarted === true) {
        return res.status(400).json({error: "Start the lab before attempting to answer"});
    }
    if (!lab || !answer) {
        return res.status(400).json({error: "Incorrect answer"});
    }
    let position = -1;
    const lastFinishedUser = await prisma.lab_users.findFirst({
        where: {
            finished_at: {not: null},
            hasFinished: true,
            finishPosition: {not: null},
            username: {not: req.user.email},
            labId: Lab
        },
        orderBy: {finished_at: "desc"},
    });
    if (!lastFinishedUser) {
        position = 1;
    } else {
        position = lastFinishedUser.finishPosition + 1;
    }
    const originalanswer = await prisma.questions_answers.findUnique({where: {
        labid: Lab
        }})
    let isCorrect = false;
    if (answer === "merejaisebhondukeliyeyeduniyanahibaniplshelp" && Lab === 1) {
        isCorrect = true;
    }else if(originalanswer.answers.toString() === answer) {
        isCorrect = true;
    }
    if (isCorrect) {
        if (user.hasFinished == true || user.hasFinished == 1) {
            // todo add some logic here
        } else {
            await prisma.lab_users.update({
                where: {
                    username_labId: {
                        username: req.user.email,
                        labId: Lab,
                    }
                },              // must be UNIQUE (e.g., id, email, etc.)
                data: {hasFinished: true, finished_at: new Date().toISOString(), finishPosition: position, labId: Lab},
            })
        }

        return res.status(200).json({
            success: true
        })
    }
    return res.status(200).json({
        success: false
    })
})

router.post("/leaderboard", authMiddleware, async (req, res) => {
    const {lab} = req.query;
    console.log(req.query);
    if (!lab) {
        return res.status(400).json({error: "Missing or invalid 'lab' query param"});
    }
    let user = await prisma.users.findUnique({
        where: {email: req.user.email},
    })
    console.log(user.nickName);
    const hasUserName = user.nickName != null
    if (!user) {
        return res.status(400).json({error: "Missing user"});
    }

    const labId = Number(lab);
    if (Number.isNaN(labId) || labId <= 0) {
        return res.status(400).json({error: "'lab' must be a positive integer"});
    }

    const TOP_LIMIT = 200; // limit results for safety; adjust as needed

    const leaderboard = await prisma.$queryRaw`
        SELECT lu.id, u.nickName AS username, lu.finishPosition, lu.finished_at
        FROM lab_users lu
                 INNER JOIN users u ON lu.username = u.email
        WHERE lu.labId = ${labId}
          AND lu.hasFinished = true
          AND u.nickName IS NOT NULL
        ORDER BY lu.finishPosition ASC
            LIMIT ${TOP_LIMIT};
    `;

    return res.json({leaderboard, hasUserName});
})

router.get("/registrations", authMiddleware, async (req, res) => {
    const {lab} = req.query;
    const labId = Number(lab);
    console.log(lab);
    if (!lab || Number.isNaN(labId) || labId <= 0) {
        return res.status(400).json({error: "'lab' must be a positive integer"});
    }


    const result = await prisma.lab_users.findMany({
        where: {
            labId: labId
        }
    });

    return res.status(200).json({
        registered: result.length,
    })
})

router.get("/stats", authMiddleware, async (req, res) => {
    const {lab} = req.query;
    const labId = Number(lab);
    console.log(lab);
    if (!lab || Number.isNaN(labId) || labId <= 0) {
        return res.status(400).json({error: "'lab' must be a positive integer"});
    }
    let user = await prisma.lab_users.findUnique({
        where: {
            username_labId: {
                username: req.user.email,
                labId: labId,
            },
        }
    })


    const result = await prisma.lab_users.findMany({
        where: {
            hasStarted: true,
            labId: labId
        }
    });
    const result2 = await prisma.lab_users.findMany({
        where: {
            hasFinished: true,
            labId: labId
        }
    });
    if (user){
        return res.status(200).json({
            Started: result.length,
            Finished: result2.length,
            hasFinished: user.hasFinished,
            finishingPosition: user.finishPosition
        })
    }else{
        return res.status(200).json({
            Started: result.length,
            Finished: result2.length,
            hasFinished: false,
            finishingPosition:-1
        });
    }

})

module.exports = {
    verifyRouter: router
}