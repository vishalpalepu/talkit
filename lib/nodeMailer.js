import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAILER_USER,
    pass: process.env.NODE_MAILER_PASSWORD, // Not your Google password!
  },
});
