const mongoose = require("mongoose");

const EditSchema = new mongoose.Schema(
  {
    id: String,
    bookEdits: [
      {
        category: String,
        inputs: [{ id: String, name: String, desc: String }],
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "please provide a user"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Edit", EditSchema);
