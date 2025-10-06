import { Request, Response } from "express";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import getBuffer from "../utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";
import { oauth2client } from "../utils/GoogleConfig.js";
import axios from "axios";

export const loginUser = TryCatch(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({
      message: "Authorization code is required",
    });
    return;
  }
  console.log("here");
  const googleRes = await oauth2client.getToken(code);
  console.log(googleRes, "here google res");
  oauth2client.setCredentials(googleRes.tokens);

  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
  );

  console.log(userRes, "here user res");

  const { email, name, picture } = userRes.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture,
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });

  res.status(200).json({
    message: "Login success",
    token,
    user,
  });
});

export const myProfile = TryCatch(async (req, res) => {
  const user = req.user;

  res.json(user);
});

export const getUserProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
    return;
  }
  res.json(user);
});

export const updateUser = TryCatch(async (req, res) => {
  const { name, instagram, linkedin, bio, facebook } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      name,
      instagram,
      facebook,
      bio,
      linkedin,
    },
    { new: true }
  );
  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });
  res.json({
    message: "User Updated",
    token,
    user,
  });
});

export const updatedProfilePic = TryCatch(async (req, res) => {
  const file: any = (req as any).file ?? (req as any).files?.file;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileBuffer = getBuffer(file);
  const content = fileBuffer?.content;
  if (!content) {
    return res.status(400).json({ message: "Failed to generate buffer" });
  }

  const cloud = await cloudinary.uploader.upload(content, {
    folder: "Blogs",
  });

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { image: cloud.secure_url },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });

  return res.status(200).json({
    message: "User Profile Pic updated",
    token,
    user,
  });
});

export const aiTitleResponse = TryCatch(async (req, res) => {
  const { text } = req.body;
});
