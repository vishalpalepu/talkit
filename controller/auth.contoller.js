import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import multer from "multer";

const storage = multer.memoryStorage();
// Configure multer
export const upload = multer({
  storage: storage,
});

// register connection done (not yet)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
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
      return res
        .status(201)
        .json({ success: true, message: " new user created " });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user input " });
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "empty input" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: " Unauthorized - User Not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - incorrect password" });
    } else {
      generateToken(user._id.toString(), res);
      return res
        .status(200)
        .json({ success: true, message: " Login Successful" });
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const image = req.file;
    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }
    const fileStr = `data:${image.mimetype};base64,${image.buffer.toString(
      "base64"
    )}`;

    const cloudinaryResponse = await cloudinary.uploader.upload(fileStr);
    const user = await User.findById(req.user._id);
    user.profilePic = cloudinaryResponse.secure_url;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      user: req.user,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
