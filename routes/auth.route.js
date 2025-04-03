import authRouter from "express";

authRouter.post("/login");
authRouter.post("/logout");
authRouter.post("/register");
authRouter.put("/update-profile"); // needs to be secure channel (middleware)
authRouter.get("/check"); // needs a secure channel (middleware)
