const sendEmail = require("./sendEmail");
const sgMail = require("@sendgrid/mail");

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const url = `${origin}/verify-email/?token=${verificationToken}&email=${email}`;
  const message = `<p>please confirm your email by clicking on the following link :
  <a href="${url}">Link</a></p>`;

  // for testing only

  // return sendEmail({
  //   to: email,
  //   subject: "Email Confirmation",
  //   html: `<h4>Hello ${name}</h4>
  //   ${message}
  //   `,
  // });

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: "fekete_gabor@outlook.hu",
    subject: "Account Confirmation",
    html: `<h4>Hello ${name}</h4>
    ${message}
    `,
  };

  await sgMail.send(msg);
};

module.exports = sendVerificationEmail;
