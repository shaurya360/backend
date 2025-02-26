const mongoose = require("mongoose");

const messageModel = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    content: {
      type: String,
      default: "undefined",
    },
    image: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date, // Timestamp for self-destructing messages
      default: null,
    },
    sendAt: {
      type: Date, // Timestamp for scheduled messages
      default: null,
    },
    delivered: {
      type: Boolean,
      default: false, // Mark if the message was delivered
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageModel);
