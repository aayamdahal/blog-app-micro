// controllers/blog.ts
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";

export const getAllBlogs = TryCatch(async (_req, res) => {
  const blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;
  res.status(200).json(blogs);
});
