const nodemailer = require('nodemailer');

let transport;

function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  transport ||= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transport;
}

// Sends through SMTP. Without SMTP settings the message is printed to the console in development only.
async function sendMail({ to, subject, text, html }) {
  const mailer = getTransport();
  if (!mailer) {
    if (process.env.NODE_ENV === 'production') console.warn(`SMTP is not configured, email to ${to} was not sent`);
    else console.log(`\n[email to ${to}] ${subject}\n${text}\n`);
    return;
  }
  await mailer.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text, html });
}

module.exports = { sendMail };
