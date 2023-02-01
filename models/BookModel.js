const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    id: String,
    title: {
      type: String,
      trim: true,
    },
    subtitle: String,
    authors: Array,
    averageRating: Number,
    ratingsCount: Number,
    categories: Array,
    language: String,
    pageCount: {
      type: Number,
    },
    publisher: String,
    publishedDate: String,
    description: String,
    image: String,
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

module.exports = mongoose.model("Book", BookSchema);
