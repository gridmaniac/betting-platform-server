const pug = require("pug");
const fs = require("fs");
const path = require("path");
const Setting = require("../models/setting");

async function sendMail(to, subject, html) {
  try {
    const apiKey = await Setting.findOne({ name: "SENDGRID_API_KEY" });
    if (!apiKey) throw new Error("SENDGRID_API_KEY is missing.");

    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(apiKey.value);

    const from = await Setting.findOne({ name: "SENDGRID_FROM" });
    if (!from) throw new Error("SENDGRID_FROM is missing.");

    const msg = {
      to,
      from: from.value,
      subject,
      html,
    };

    await sgMail.send(msg);
  } catch (e) {
    console.error("Mail: ", e.message);
  }
}

module.exports.sendEmailConfirmation = async function (to, userId) {
  const template = await fs.promises.readFile(
    path.resolve(__dirname, "../templates/confirm-email.pug"),
    "utf-8"
  );

  const domain = await Setting.findOne({ name: "DOMAIN" });
  const html = pug.render(template, {
    confirmationLink: `${domain?.value}?confirmationCode=${userId}`,
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
