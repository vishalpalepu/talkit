import express from "express";
import {
  register,
  login,
  logout,
  updateProfile,
  getUserProfile,
} from "../controller/auth.contoller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../controller/auth.contoller.js";

const Router = express.Router();

Router.post("/login", login);
Router.post("/logout", logout);
Router.post("/register", register);
Router.put(
  "/updateProfile",
  upload.single("profilePic"),
  protectRoute,
  updateProfile
); // needs to be secure channel (middleware)
Router.get("/check", protectRoute, getUserProfile); // needs a secure channel (middleware)

export default Router;
