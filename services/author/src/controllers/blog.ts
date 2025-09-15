import getBuffer from "../utils/dataUri.js";
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import cloudinary from "cloudinary";
export const createBlog = TryCatch(async (req, res) => {
  const { title, description, blogcontent, category } = req.body;

  const file: any = (req as any).file ?? (req as any).files?.file;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileBuffer = getBuffer(file);
  const content = fileBuffer?.content;
  if (!content) {
    return res.status(400).json({ message: "Failed to generate buffer" });
  }
  const cloud = await cloudinary.v2.uploader.upload(content, {
    folder: "blogs",
  });

  const result = await sql`
  INSERT INTO blogs (title, description, blogcontent, image, category, author)
  VALUES (${title}, ${description}, ${blogcontent}, ${cloud.secure_url}, ${category}, ${req.user?._id})
  RETURNING *`;

  res.json({
    message: "Blog Created",
    blog: result[0],
  });
});

export const updateBlog = TryCatch(async (req, res) => {
  const id = req.params.id;
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;
  const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;

  if (!blog.length) {
    res.status(404).json({ message: "Blog not found" });
    return;
  }
  if (blog[0].author !== req.user?._id) {
    res.status(401).json({
      message: "You are not the author of this blog",
    });
    return;
  }

  let imageURL = blog[0].image;

  if (file) {
    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "Failed to generate buffer",
      });
      return;
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    imageURL = cloud.secure_url;
  }
  const updatedBlog = await sql`
    UPDATE blogs SET  
    title = ${title || blog[0].title},
    description = ${title || blog[0].description},
    image = ${imageURL},
    blogcontent = ${title || blog[0].blogcontent},
    category = ${title || blog[0].category} 

    where id =${id}
    RETURNING *
  `;
  res.json({
    message: "Blog Updated",
    blog: updatedBlog[0],
  });
});

export const deleteBlog = TryCatch(async (req, res) => {
  const blog = await sql`SELECT * FROM blogs where id = ${req.params.id}`;
  if (!blog.length) {
    res.status(404).json({ message: "Blog not found" });
    return;
  }
  if (blog[0].author !== req.user?._id) {
    res.status(401).json({
      message: "You are not the author of this blog",
    });
    return;
  }
  await sql`DELETE FROM savedblogs WHERE blogid = ${req.params.id}`;
  await sql`DELETE FROM comments WHERE blogid = ${req.params.id}`;
  await sql`DELETE FROM blogs WHERE id = ${req.params.id}`;

  res.json({
    message: "Blog deleted",
  });
});
