import dotenv from "dotenv"
import connectDB from "./db/connect-db.js"

dotenv.config({
    path: "./.env"
})

const port = process.env.PORT

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`app is running on ${port}`)
    })
})
.catch((error) => {
    console.log(`DB connection failed: ${error}`)
})