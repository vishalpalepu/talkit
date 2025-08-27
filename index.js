import express, { json, urlencoded } from "express";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import messsageRouter from "./routes/message.route.js";
import cors from "cors";

import { server, app } from "./lib/socket.js";

dotenv.config();

app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(
  cors({
    origin: [ "http://localhost:3000","https://talkit-frontend.vercel.app/"], // or wherever your frontend runs
    credentials: true,
  })
);

connectDB();

/*route for messages and route for auth*/
app.use("/auth", authRouter);
app.use("/message", messsageRouter);

server.listen(process.env.ENV_PORT || 3030, () => {
  console.log(`server running at port ${process.env.ENV_PORT}`);
});
