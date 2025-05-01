import User from "../model/user.model.js";
import Message from "../model/message.model.js";
import { checkObjectIdAndConvert, uploadImage } from "../lib/utils.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

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

// export const getAllUsers = async (req, res) => {
//   try {
//     const loggedInUser = req.user;
//     const allFilteredUsers = await User.find({
//       _id: { $ne: loggedInUser._id },
//     }).select("-password");
//     if (allFilteredUsers.length === 0) {
//       return res.status(404).json({ success: false, message: "No User Found" });
//     }

//     const usersWithLastMessage = await Promise.all(
//       allFilteredUsers.map(async (user) => {
//         const lastMessage = await Message.findOne({
//           $or: [
//             { senderId: loggedInUser._id, receiverId: user._id },
//             { senderId: user._id, receiverId: loggedInUser._id },
//           ],
//         })
//           .sort({ createdAt: -1 }) // latest message
//           .limit(1);

//         return {
//           ...user.toObject(),
//           lastMessage: lastMessage || null,
//         };
//       })
//     );

//     return res.status(200).json({
//       success: true,
//       message: "All user details retrieved ",
//       allFilteredUsers: usersWithLastMessage,
//     });
//   } catch (err) {
//     if (process.env.NODE_ENV === "development") console.log(err);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal Server Error" });
//   }
// };

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

// export const sendMessage = async (req, res) => {
//   try {
//     const { id: to } = req.params;
//     /*console.log(to); working properly */
//     /* error where the req.body is undefind*/
//     const { text, image } = req.body;
//     const from = req.user._id;

//     let imageUrl;
//     if (image) {
//       const cloudinaryResponse = await cloudinary.uploader.upload(image);
//       imageUrl = cloudinaryResponse.secure_url;
//     }
//     const { fromId, toId } = checkObjectIdAndConvert(from, to);

//     const message = await Message.create({
//       senderID: fromId,
//       receiverID: toId,
//       text: text,
//       image: imageUrl,
//     });

//     await message.save();

//     res
//       .status(201)
//       .json({ success: true, message: "message Sent successfully" });
//   } catch (err) {
//     if (process.env.NODE_ENV === "development") console.log(err);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal Server Error" });
//   }
// };

export const sendMessage = async (req, res) => {
  try {
    const { id: to } = req.params;
    /*console.log(to); working properly */
    /* error where the req.body is undefind*/
    const { text } = req.body;
    const image = req.file;
    const from = req.user._id;

    if (!text && !image) {
      res.status(400).json({
        success: false,
        message: "No message or image is sent",
      });
    }

    let imageUrl;
    if (image) {
      const fileStr = `data:${image.mimetype};base64,${image.buffer.toString(
        "base64"
      )}`;
      const cloudinaryResponse = await uploadImage(fileStr, "talkit/messages");
      imageUrl = cloudinaryResponse.secure_url;
    }
    const { fromId, toId } = checkObjectIdAndConvert(from, to);

    const message = await Message.create({
      senderID: fromId,
      receiverID: toId,
      text: text,
      image: imageUrl,
    });

    await message.save();

    const receiverSocketId = getReceiverSocketId(toId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json({
      success: true,
      message: "message Sent successfully",
      data: message,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
