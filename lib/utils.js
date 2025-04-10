import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  if (!token) throw new Error("token generation failed");

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export const checkObjectIdAndConvert = (from, to) => {
  // Check if both from and to are valid ObjectId values
  if (
    !mongoose.Types.ObjectId.isValid(from) ||
    !mongoose.Types.ObjectId.isValid(to)
  ) {
    throw new Error("Invalid user ID");
  }

  // Convert them into ObjectId instances
  const fromId = new mongoose.Types.ObjectId(from);
  const toId = new mongoose.Types.ObjectId(to);

  // Return both as an object
  return { fromId, toId };
};
