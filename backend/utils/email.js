const nodemailer = require("nodemailer")

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Send email function
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return result
  } catch (error) {
    console.error("Email sending error:", error)
    throw error
  }
}

module.exports = { sendEmail }
