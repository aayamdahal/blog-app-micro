import jwt from "jsonwebtoken";
export async function isAuth(req, res, next) {
    try {
        const authHeader = req.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Please login - No auth header" });
        }
        const token = authHeader.slice(7).trim();
        const decoded = jwt.verify(token, process.env.JWT_SEC);
        if (!decoded || !decoded.user) {
            return res.status(401).json({ message: "Invalid Token" });
        }
        req.user = decoded.user;
        return next();
    }
    catch (err) {
        console.error("JWT verification error:", err);
        return res.status(401).json({ message: "Invalid/expired token" });
    }
}
