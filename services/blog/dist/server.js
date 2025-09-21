import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.js";
import { createClient } from "redis";
dotenv.config();
const app = express();
const port = process.env.PORT;
export const redisClient = createClient({
    url: process.env.REDIS_URL,
});
redisClient
    .connect()
    .then(() => console.log("redis connected"))
    .catch(console.error);
app.use("/api/v1", blogRoutes);
app.listen(port, () => {
    console.log(`server is running on ${port}`);
});
