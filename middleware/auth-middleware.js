const jwt = require("jsonwebtoken");
const Token = require("../models/TokenModel");

const auth = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = {
        userID: payload.userID,
        name: payload.name,
        email: payload.email,
      };
      return next();
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const existingToken = await Token.findOne({
      user: payload.userID,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      return res.status(401).send("Authentication invalid");
    }

    const oneHour = 1000 * 60 * 60;
    const { userID, name, email } = payload;

    // sign accesToken
    const accessTokenJWT = jwt.sign(
      { userID, name, email },
      process.env.JWT_SECRET
    );

    // create accessToken cookie
    res.cookie("accessToken", accessTokenJWT, {
      httpOnly: false,
      expires: new Date(Date.now() + oneHour),
      secure: true,
      sameSite: "none",
      singed: true,
      domain: "https://the-bookshelf-project.netlify.app",
    });

    req.user = payload;

    next();
  } catch (error) {
    throw new Error("Authentication invalid");
  }
};

module.exports = auth;
