const User = require("../models/UserModel");
const Token = require("../models/TokenModel");
const { sendVerificationEmail, sendResetPasswordEmail } = require("../utils");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email });

  if (emailAlreadyExists) return res.status(401).send("Email already exists");

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const verificationToken = crypto.randomBytes(40).toString("hex");
  const passwordToken = "";
  const passwordTokenExpirationDate = Date.now();
  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
    passwordToken,
    passwordTokenExpirationDate,
  });

  const origin = "http://localhost:3000";

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  res
    .status(201)
    .json({ msg: "Please check your email to verify your account!" });
};

const verifyEmail = async (req, res) => {
  const { email, verificationToken } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).send("verification failed");
  }

  if (user.verificationToken !== verificationToken) {
    return res.status(401).send("verification failed");
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";

  await user.save();
  res.status(200).json({ msg: "email verified" });
};

const showCurrentUser = async (req, res) => {
  let { user } = req;

  if (!user) {
    return res.status(401).send("Please provide valid credentials!");
  }

  const findUser = await User.findOne({ email: user.email });
  const { notification } = findUser;

  user = { ...user, notification };

  res.status(200).json({ user });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).send("please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).send("please provide valid credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return res.status(401).send("please provide valid credentials");
  }

  const { isVerified } = user;

  if (!isVerified) {
    return res.status(401).send("please verify your account");
  }

  // create refreshToken
  let refreshToken = "";

  // check DB for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      return res.status(401).send("please provide valid credentials");
    }

    // make refreshToken equal with the existing token
    refreshToken = existingToken.refreshToken;

    // create refreshToken cookie
    const oneMonth = 1000 * 60 * 60 * 24 * 30;
    const refreshTokenJWT = user.createJWT(refreshToken);
    res.cookie("refreshToken", refreshTokenJWT, {
      httpOnly: true,
      expires: new Date(Date.now() + oneMonth),
      secure: process.env.NODE_ENV === "production",
      signed: true,
    });

    return res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        notification: user.notification,
      },
    });
  }

  // if refreshToken doesn't exist create a new one
  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  // create accessToken cookie
  const oneHour = 1000 * 60 * 60;
  const accessTokenJWT = user.createJWT();
  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + oneHour),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });

  // create refreshToken cookie
  const oneMonth = 1000 * 60 * 60 * 24 * 30;
  const refreshTokenJWT = user.createJWT(refreshToken);
  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + oneMonth),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });

  res.status(200).json({
    user: {
      name: user.name,
      email: user.email,
      notification: user.notification,
    },
  });
};

const logout = async (req, res) => {
  const { userID } = req.user;

  await Token.findOneAndDelete({ user: userID });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(200).json("see you next time!");
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(401).send("please provide valid email");
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");

    const origin = "http://localhost:3000";

    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      passwordToken,
      origin,
    });

    const oneHour = 1000 * 60 * 60;

    user.passwordToken = passwordToken;
    user.passwordTokenExpirationDate = new Date(Date.now() + oneHour);

    await user.save();
  }

  res
    .status(200)
    .json({ msg: "Please check your emails for reset password link!" });
};

const resetPassword = async (req, res) => {
  const { token, email, newPassword, confirmPassword } = req.body;

  if (!token || !email || !newPassword || !confirmPassword) {
    return res.status(401).json({ msg: "Please provide all values" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(401).json({ msg: "The passwords needs to match!" });
  }

  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === token &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = newPassword;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;

      await user.save();
    }
  }

  res.status(200).json({ msg: "Password reseted!" });
};

const changeUserNotifications = async (req, res) => {
  const { email, notification } = req.body;
  const update = { ...req.body, notification: !notification };

  const user = await User.findOneAndUpdate({ email }, update, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(401).send("Please provide valid credentials!");
  }

  const message = notification
    ? "Notifications are turned off!"
    : "Notifications are turned on!";

  res.status(200).json({ message, notificationStatus: update.notification });
};

module.exports = {
  register,
  verifyEmail,
  showCurrentUser,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changeUserNotifications,
};