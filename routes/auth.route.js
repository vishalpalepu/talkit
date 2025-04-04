import express from "express";
import { register } from "../controller/auth.contoller.js";

const Router = express.Router();

// Router.post("/login");
// Router.post("/logout");
Router.post("/register", register);
// Router.put("/update-profile"); // needs to be secure channel (middleware)
// Router.get("/check"); // needs a secure channel (middleware)

export default Router;
