const express = require("express");
const authenticateUser = require("../middleware/auth-middleware");
const router = express.Router();
const {
  register,
  verifyEmail,
  showCurrentUser,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changeUserNotifications,
} = require("../controllers/userControllers");

router.get("/showCurrentUser", authenticateUser, showCurrentUser);
router.post("/register", register);
router.post("/verifyEmail", verifyEmail);
router.post("/login", login);
router.delete("/logout", authenticateUser, logout);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.patch("/changeUserNotifications", changeUserNotifications);

module.exports = router;
