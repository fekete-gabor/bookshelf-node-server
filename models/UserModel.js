const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide a name"],
    trim: true,
    minLength: [3, "name must be at least 3 characters long"],
    maxLength: [20, "name cannot be longer than 20 characters"],
  },
  email: {
    type: String,
    required: [true, "please provide an email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "please provide vaild email",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: [4, "password must be at least 6 characters long"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  notification: {
    type: Boolean,
    default: true,
  },
  backgroundIndex: {
    type: Number,
    default: 0,
  },
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  passwordToken: String,
  passwordTokenExpirationDate: Date,
  verified: Date,
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function (refreshToken) {
  const token = jwt.sign(
    { userID: this._id, name: this.name, email: this.email, refreshToken },
    process.env.JWT_SECRET,
    { algorithm: "HS256" }
  );
  return token;
};

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
