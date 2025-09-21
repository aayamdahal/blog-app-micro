import express from "express";
import uploadFile from "../middlewares/multer.js";
import { createBlog, deleteBlog, updateBlog } from "../controllers/blog.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express();

router.post("/blog/new", isAuth, uploadFile, createBlog);
router.post("/blog/:id", isAuth, uploadFile, updateBlog);
router.delete("/blog/:id", isAuth, deleteBlog);

export default router;
