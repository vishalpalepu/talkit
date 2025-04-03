import express, { json, urlencoded } from "express";
import path from "path";
import dotenv, { config } from "dotenv";
import { connectDB } from "./lib/db.js";

dotenv.config();
const app = express();

app.use(urlencoded({ extended: true }));
app.use(json());

connectDB();

/*route for messages and route for auth*/
app.use("/auth", () => console.log("index/auth"));
app.use("/message", () => console.log("index/message"));

app.listen(process.env.ENV_PORT || 3000, () => {
  console.log(`server running at port ${process.env.ENV_PORT}`);
});
