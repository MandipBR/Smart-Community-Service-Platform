import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    ...(process.env.NODE_ENV !== "production"
      ? { tls: { rejectUnauthorized: false } }
      : {}),
    logger: true,
    debug: true,
  });

  await transporter.sendMail({
    from: "Smart Community Platform",
    to,
    subject,
    html,
  });
};

export default sendEmail;
