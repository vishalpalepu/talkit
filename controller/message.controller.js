import User from "../model/user.model.js";
import Message from "../model/message.model.js";
import { checkObjectIdAndConvert, uploadImage } from "../lib/utils.js";
import { getReceiverSocketId, io } from "../lib/socket.js"; // Import the chatbot API function
import { getBotReplyGemini } from "../lib/chatbotAPI.js"; // Import the chatbot API function for Gemini

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

// export const sendMessage = async (req, res) => {
//   try {
//     const { id: to } = req.params;
//     /*console.log(to); working properly */
//     /* error where the req.body is undefind*/
//     const { text } = req.body;
//     const image = req.file;
//     const from = req.user._id;

//     if (!text && !image) {
//       res.status(400).json({
//         success: false,
//         message: "No message or image is sent",
//       });
//     }

//     let imageUrl;
//     if (image) {
//       const fileStr = `data:${image.mimetype};base64,${image.buffer.toString(
//         "base64"
//       )}`;
//       const cloudinaryResponse = await uploadImage(fileStr, "talkit/messages");
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

//     const receiverSocketId = getReceiverSocketId(toId);

//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", message);
//     }

//     res.status(201).json({
//       success: true,
//       message: "message Sent successfully",
//       data: message,
//     });
//   } catch (err) {
//     if (process.env.NODE_ENV === "development") console.log(err);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal Server Error" });
//   }
// };

//sucess but no bot reply
// chatbotAPI.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_API_TOKEN = process.env.HF_API_TOKEN; // Bearer token
const HF_MODEL_ID =
  process.env.HF_MODEL_ID || "mistralai/Mistral-7B-Instruct-v0.3"; // or your fallback model

export const getBotReply = async (userMessage) => {
  try {
    const endpoint = `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`;

    const response = await axios.post(
      endpoint,
      {
        inputs: userMessage,
        parameters: {
          max_new_tokens: 128,
          temperature: 0.7,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        params: {
          wait_for_model: true, // Important for cold starts
        },
      }
    );

    const generated = response.data?.[0]?.generated_text;

    if (!generated) {
      return "Sorry, I couldn't generate a reply.";
    }

    return generated;
  } catch (error) {
    console.error(
      "❌ Hugging Face API error:",
      error?.response?.data || error.message
    );
    return "Sorry, I'm having trouble responding right now.";
  }
};

// Example usage in your sendMessage function:

export const sendMessage = async (req, res) => {
  try {
    const { id: to } = req.params;
    const { text } = req.body; // User message
    const image = req.file;
    const from = req.user._id;

    if (!text && !image) {
      return res.status(400).json({
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

    // Save user message
    const message = await Message.create({
      senderID: from,
      receiverID: to,
      text,
      image: imageUrl,
    });
    await message.save();

    // Emit user message to the receiver
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    // If the recipient is the bot, get a response from Hugging Face model
    if (to === process.env.BOT_ID && text) {
      console.log("i am bot");
      const botReplyText = await getBotReplyGemini(text); // Get bot response from Hugging Face
      const botMessage = await Message.create({
        senderID: process.env.BOT_ID, // Bot ID
        receiverID: from,
        text: botReplyText,
      });
      await botMessage.save();

      // Emit bot reply back to the user
      const userSocketId = getReceiverSocketId(from);
      if (userSocketId) {
        io.to(userSocketId).emit("newMessage", botMessage);
      }
    }

    // Send response to the HTTP request
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
