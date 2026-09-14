// backend/services/emailService.js
//
// Thin wrapper around nodemailer. Two templates are supported:
//   - sendResetEmail   → password reset link
//   - sendContactEmail → contact form notification to the team
//
// Anything user-provided that ends up in HTML is escaped to prevent
// HTML injection into the outgoing email.

import nodemailer from 'nodemailer'

// ---------- Transport ----------

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === 'true', // true for port 465, false otherwise
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  // Without these, a hung SMTP server can block the HTTP request forever.
  connectionTimeout: 10_000,
  greetingTimeout:   10_000,
  socketTimeout:     15_000,
})

// ---------- Helpers ----------

/**
 * Escape the minimum set of characters to make a string safe inside
 * an HTML context. Good enough for our simple emails.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Split a message on newlines and render as <br>-joined HTML. */
function renderMultiline(value) {
  return escapeHtml(value).replace(/\r?\n/g, '<br>')
}

// ---------- Templates ----------

/** Password reset email. */
export async function sendResetEmail({ name, email, resetLink }) {
  const safeName = escapeHtml(name || 'there')
  const safeLink = escapeHtml(resetLink)

  await transporter.sendMail({
    from: `"CleanSpaces" <${process.env.MAIL_FROM}>`,
    to: email,
    subject: 'Reset your CleanSpaces password',
    text: `
Hi ${name || 'there'},

We received a request to reset your CleanSpaces password.
Click the link below to choose a new one. This link expires in 1 hour.

${resetLink}

If you didn't request this, you can safely ignore this email —
your password will not be changed.
    `.trim(),
    html: `
      <p>Hi ${safeName},</p>
      <p>
        We received a request to reset your CleanSpaces password.
        Click the button below to choose a new one.
        This link expires in 1 hour.
      </p>
      <p>
        <a href="${safeLink}"
           style="display:inline-block;padding:10px 20px;background:#7cb342;
                  color:#0b2a25;text-decoration:none;border-radius:6px;
                  font-weight:bold;">
          Reset Password
        </a>
      </p>
      <p>
        Or copy and paste this link into your browser:<br>
        <span style="word-break:break-all;">${safeLink}</span>
      </p>
      <p>
        If you didn't request this, you can safely ignore this email —
        your password will not be changed.
      </p>
    `.trim(),
  })
}

/** Contact-form notification email to the team inbox. */
export async function sendContactEmail({ name, email, phone, subject, message }) {
  const to = process.env.MAIL_TO
  if (!to) {
    throw new Error('MAIL_TO is not set — cannot deliver contact-form email.')
  }

  const safeName    = escapeHtml(name)
  const safeEmail   = escapeHtml(email)
  const safePhone   = escapeHtml(phone || 'Not provided')
  const safeSubject = escapeHtml(subject)
  const safeMessage = renderMultiline(message)

  await transporter.sendMail({
    from: `"CleanSpaces Contact Form" <${process.env.MAIL_FROM}>`,
    to,
    replyTo: email, // unescaped — nodemailer validates this
    subject: `CleanSpaces Contact: ${subject}`, // headers are handled by nodemailer
    text: `
New contact form submission

Name:    ${name}
Email:   ${email}
Phone:   ${phone || 'Not provided'}
Subject: ${subject}

Message:
${message}
    `.trim(),
    html: `
      <h2>New CleanSpaces Contact Submission</h2>
      <p><strong>Name:</strong>    ${safeName}</p>
      <p><strong>Email:</strong>   ${safeEmail}</p>
      <p><strong>Phone:</strong>   ${safePhone}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <h3>Message</h3>
      <p>${safeMessage}</p>
    `.trim(),
  })
}