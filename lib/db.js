import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL).then(() => {
      console.log("mongoDB connected successfully");
    });
  } catch (err) {
    console.log("mongodb error", err);
  }
};
