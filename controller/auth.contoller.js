import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    await user.save();
    if (user) {
      generateToken(user._id.toString(), res);
      return res.status(201).json({ message: " new user created " });
    } else {
      return res.status(400).json({ message: "Invalid user input " });
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email;
    if (!email || !password) {
      return res.status(400).json({ massage: "empty input" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: " Unauthorized - User Not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Unauthorized - incorrect password" });
    } else {
      generateToken(user._id.toString(), res);
      return res.status(200).json({ message: " Login Successful" });
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const image = req.body.image;
    if (!image) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(image);
    const user = await User.findById(req.user._id);
    user.image = cloudinaryResponse.secure_url;
    await user.save();
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    return res.status(200).json({
      message: "User details retrieved successfully",
      user: req.user,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
