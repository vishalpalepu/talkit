import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import cloudinary from "./cloudinary.js";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  if (!token) throw new Error("token generation failed");

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export const checkObjectIdAndConvert = (from, to) => {
  // Check if both from and to are valid ObjectId values
  if (
    !mongoose.Types.ObjectId.isValid(from) ||
    !mongoose.Types.ObjectId.isValid(to)
  ) {
    throw new Error("Invalid user ID");
  }

  // Convert them into ObjectId instances
  const fromId = new mongoose.Types.ObjectId(from);
  const toId = new mongoose.Types.ObjectId(to);

  // Return both as an object
  return { fromId, toId };
};

export const extractPublicId = (secureUrl) => {
  // Match the public ID in the secure URL using a regular expression
  const regex = /\/upload\/(?:v\d+\/)?([^/]+(?:\/[^/]+)*)\.[^/]+$/;
  const match = secureUrl.match(regex);

  console.log(secureUrl);

  if (match) {
    return match[1]; // This is the public ID
  } else {
    throw new Error("Invalid secure URL format");
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(result); // If successful, it will return a result object
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

// Define your thresholds for size and quality
const SIZE_THRESHOLD_MB = 1; // 1 MB (adjust as needed)
const MAX_WIDTH = 800; // Max width to resize large images
const QUALITY = 50; // Quality reduction for larger images
const MAX_QUALITY = 100; // Keep quality at 100 for smaller images

export const uploadImage = async (fileStr, folder) => {
  try {
    let uploadOptions = {
      folder: folder, // Specify the folder to upload the image
      quality: MAX_QUALITY, // Set the maximum quality for smaller images
      crop: "limit", // Limit the size while maintaining aspect ratio
    };

    //debug
    const originalSizeMB = Buffer.byteLength(fileStr, "base64") / (1024 * 1024); // in MB
    console.log(`Original image size: ${originalSizeMB.toFixed(2)} MB`);
    //debug

    // Convert the image size to MB
    const imageSizeMB = fileStr.length / (1024 * 1024); // Approximate size in MB (based on base64 string length)
    // Check if the image is large
    if (imageSizeMB > SIZE_THRESHOLD_MB) {
      // Reduce quality for larger images
      uploadOptions.quality = QUALITY;
    }

    // Upload the image to Cloudinary with the desired transformations
    const cloudinaryResponse = await cloudinary.uploader.upload(
      fileStr,
      uploadOptions
    );

    //debug
    const uploadedSizeMB = cloudinaryResponse.bytes / (1024 * 1024); // in MB
    console.log(`Uploaded image size: ${uploadedSizeMB.toFixed(2)} MB`);
    //debug

    return cloudinaryResponse; // Return the response so we can use the URL
  } catch (err) {
    throw new Error("Error uploading image: " + err.message);
  }
};
