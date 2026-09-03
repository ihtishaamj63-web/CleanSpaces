import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendContactEmail = async ({
  name,
  email,
  phone,
  subject,
  message,
}) => {
  await transporter.sendMail({
    from: `"CleanSpaces Contact Form" <${process.env.MAIL_FROM}>`,
    to: process.env.MAIL_TO,
    replyTo: email,
    subject: `CleanSpaces Contact: ${subject}`,
    text: `
New contact form submission

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Subject: ${subject}

Message:
${message}
    `,
    html: `
      <h2>New CleanSpaces Contact Submission</h2>

      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Subject:</strong> ${subject}</p>

      <h3>Message</h3>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });
};
