const sendEmail = require("./sendEmail");
const sgMail = require("@sendgrid/mail");

const sendResetPasswordEmail = async ({
  name,
  email,
  passwordToken,
  origin,
}) => {
  const url = `${origin}/reset-password/?token=${passwordToken}&email=${email}`;
  const message = `<p>you can reset your password by clicking on the following link :
  <a href="${url}">Link</a></p>`;

  return sendEmail({
    to: email,
    subject: "Reset Password",
    html: `<h4>Hello ${name}</h4>
    ${message}
    `,
  });

  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  // const msg = {
  //   to: email,
  //   from: "fekete_gabor@outlook.hu",
  //   subject: "Reset Password",
  //   html: `<h4>Hello ${name}</h4>
  //   ${message}
  //   `,
  // };

  // await sgMail.send(msg);
};

module.exports = sendResetPasswordEmail;
