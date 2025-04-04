import express from "express";
import { register, login } from "../controller/auth.contoller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const Router = express.Router();

Router.post("/login", login);
Router.get("/logout", protectRoute, (req, res) => {
  return res.send("middleware successful");
});
Router.post("/register", register);
// Router.put("/update-profile"); // needs to be secure channel (middleware)
// Router.get("/check"); // needs a secure channel (middleware)

export default Router;
