const nodemailer = require("nodemailer");
const nodemailerConfig = require("./nodemailerConfig");

// for testing only
const sendEmail = async ({ to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail({
    from: '"Bookshelf_" <fekete_gabor@outlook.hu>',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
