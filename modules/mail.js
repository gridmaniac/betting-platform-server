const pug = require("pug");
const fs = require("fs");
const path = require("path");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMail(to, subject, html) {
  try {
    const msg = {
      to,
      from: "KOA Combat LLC",
      subject,
      html,
    };

    await sgMail.send(msg);
  } catch (e) {
    console.error(e.message);
  }
}

module.exports.sendEmailConfirmation = async function (to, userId) {
  const template = await fs.promises.readFile(
    path.resolve(__dirname, "../templates/confirm-email.pug"),
    "utf-8"
  );

  const html = pug.render(template, {
    confirmationLink: `${process.env.DOMAIN}?confirmationCode=${userId}`,
  });
  await sendMail(to, "Welcome to KOA Combat! Confirm Your Email", html);
};

module.exports.sendResetPassword = async function (to, password) {
  const template = await fs.promises.readFile(
    path.resolve(__dirname, "../templates/reset-email.pug"),
    "utf-8"
  );

  const html = pug.render(template, { password });
  await sendMail(to, "[KOA Combat] Your password has changed", html);
};
