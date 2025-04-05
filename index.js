import express, { json, urlencoded } from "express";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import messsageRouter from "./routes/message.route.js";

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(json());

connectDB();

/*route for messages and route for auth*/
app.use("/auth", authRouter);
app.use("/message", messsageRouter);

app.listen(process.env.ENV_PORT || 3030, () => {
  console.log(`server running at port ${process.env.ENV_PORT}`);
});
