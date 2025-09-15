import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  bio: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function isAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please login - No auth header" });
    }

    const token = authHeader.slice(7).trim();
    const decoded = jwt.verify(
      token,
      process.env.JWT_SEC as string
    ) as JwtPayload;

    if (!decoded || !(decoded as any).user) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    req.user = (decoded as any).user;
    return next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}
