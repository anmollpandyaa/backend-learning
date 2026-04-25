import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { LIMIT } from "./constants.js"

const app = express()

app.use(cors({origin: process.env.CORS_ORIGIN}))
app.use(express.json({limit: LIMIT}))
app.use(express.urlencoded({extended: true, limit: LIMIT}))
app.use(express.static("public"))
app.use(cookieParser())

import { router } from "./routes/user.route.js"
app.use("/api/users", router)

export { app }