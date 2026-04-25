const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP config missing (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || "no-reply@example.com";
  const t = getTransporter();
  await t.sendMail({ from, to, subject, html, text });
}

module.exports = { sendMail };

