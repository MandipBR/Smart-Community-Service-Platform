import nodemailer from "nodemailer";

// Fix: cache the transporter at module level so a new TCP connection
// is NOT opened on every single email (was causing connection issues under load)
let _transporter = null;
const getTransporter = () => {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Fix: only enable TLS relaxation and debug logging outside production
    ...(process.env.NODE_ENV !== "production"
      ? { tls: { rejectUnauthorized: false }, logger: true, debug: true }
      : {}),
  });
  return _transporter;
};

const sendEmail = async (to, subject, html) => {
  const transporter = getTransporter();
  // Fix: from field now includes the email address — some SMTP servers reject name-only
  await transporter.sendMail({
    from: `Smart Community Platform <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
