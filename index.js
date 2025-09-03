const express = require('express');
const app = express();
const {authRouter} = require('./routes/authrouter');
const {profileRouter} = require('./routes/profile');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const {registerRouter} = require("./routes/registerations");

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.FRONTEND_BASE_URL,
        credentials: true
    }));

app.use("/api/auth", authRouter)
app.use("/api/profile", profileRouter)
app.use("/api/register", registerRouter);

app.get("/", (req, res) => {
    res.status(200).send("Welcome to our accounts.");
})

app.listen(8080, () => {console.log("Listening on port 8080")});



