//jwt verification and storing the user details into req.user
//needed imports are jwt User model

import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: " Unauthonrized - Incorrect Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - no user found" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
