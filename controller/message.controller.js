import User from "../model/user.model.js";
import Message from "../model/message.model.js";
import { checkObjectIdAndConvert } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const allFilteredUsers = await User.find({
      _id: { $ne: loggedInUser._id },
    }).select("-password");
    if (allFilteredUsers.length === 0) {
      return res.status(404).json({ success: false, message: "No User Found" });
    }

    return res.status(200).json({
      success: true,
      message: "All user details retrieved ",
      allFilteredUsers,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { id: to } = req.params;
    const from = req.user._id;

    const { fromId, toId } = checkObjectIdAndConvert(from, to);

    /* 
        const from = "5f8d0d55b54764421b7156d2";  // Example string representation of an ObjectId
        const fromId = new mongoose.Types.ObjectId(from); // Converts the string to an ObjectId instance

        why? query with mongodb needs objectId type if we use string it might cause an error 

    */

    const messages = await Message.find({
      $or: [
        { senderID: fromId, receiverID: toId },
        { senderID: toId, receiverID: fromId },
      ],
    });

    if (messages.length === 0) {
      return res
        .status(404)
        .json({ success: true, message: "New to the talkit " });
    }

    return res
      .status(200)
      .json({ success: true, message: "All messages retrieved", messages });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: to } = req.params;
    const { text, image } = req.body;
    const from = req.user._id;

    let imageUrl;
    if (image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image);
      imageUrl = cloudinaryResponse.secure_url;
    }
    const { fromId, toId } = checkObjectIdAndConvert(from, to);

    const message = await Message.create({
      senderID: fromId,
      receriverId: toId,
      text: text,
      image: imageUrl,
    });

    await message.save();

    res
      .status(201)
      .json({ success: true, message: "message Sent successfully" });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
