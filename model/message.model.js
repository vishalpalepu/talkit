import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  senderID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  receiverID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  test: {
    type: String,
  },
  image: {
    type: String,
  },
});

const message = mongoose.model("message", messageSchema);

module.exports = message;
