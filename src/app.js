import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "64kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

import categoryRouter from './routes/category.routes.js'
import commentRouter from './routes/comment.route.js'
import groupRouter from './routes/group.route.js'
import messageRouter from './routes/message.route.js'
import notificationRouter from './routes/notification.route.js'
import subTaskRouter from './routes/subTask.route.js'
import taskRouter from './routes/task.route.js'
import userRouter from './routes/user.routes.js'

app.use("v1/u", userRouter)
app.use("v1/c", commentRouter)
app.use("v1/g", groupRouter)
app.use("v1/cat", categoryRouter)
app.use("v1/com", commentRouter)
app.use("v1/mess", messageRouter)
app.use("v1/notif", notificationRouter)
app.use("v1/sub", subTaskRouter)
app.use("v1/tsks", taskRouter)

export { app }