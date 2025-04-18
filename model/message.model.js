import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  senderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  test: {
    type: String,
  },
  image: {
    type: String,
  },
});

const Message = mongoose.model("message", messageSchema);

export default Message;
