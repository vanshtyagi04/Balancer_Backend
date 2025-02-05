import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from './app.js'
import startTaskReminder from "./utils/sendTaskRemainder.js";

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running on port : ${process.env.PORT}`);
            startTaskReminder();
        })
    })
    .catch((err) => {
        console.log("MongoDB connection failed ", err);
    })