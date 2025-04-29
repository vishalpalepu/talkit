import express from "express";
import {
  getAllUsers,
  getAllMessages,
  sendMessage,
} from "../controller/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../controller/auth.contoller.js";

const Router = express.Router();

Router.get("/getAllUser", protectRoute, getAllUsers);
Router.get("/getAllMessages/:id", protectRoute, getAllMessages);
Router.post("/send/:id", protectRoute, upload.single("image"), sendMessage);

export default Router;
