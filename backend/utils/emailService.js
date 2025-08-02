const { sendEmail } = require("./email")

const sendTicketCreatedEmail = async (ticket, user) => {
  try {
    const subject = `Ticket Created: ${ticket.subject}`
    const text = `
Hello ${user.name},

Your support ticket has been created successfully.

Ticket Details:
- Ticket ID: ${ticket.ticketId}
- Subject: ${ticket.subject}
- Priority: ${ticket.priority}
- Status: ${ticket.status}

We will review your ticket and get back to you as soon as possible.

Best regards,
QuickDesk Support Team
    `

    const html = `
<h2>Ticket Created Successfully</h2>
<p>Hello ${user.name},</p>
<p>Your support ticket has been created successfully.</p>

<h3>Ticket Details:</h3>
<ul>
  <li><strong>Ticket ID:</strong> ${ticket.ticketId}</li>
  <li><strong>Subject:</strong> ${ticket.subject}</li>
  <li><strong>Priority:</strong> ${ticket.priority}</li>
  <li><strong>Status:</strong> ${ticket.status}</li>
</ul>

<p>We will review your ticket and get back to you as soon as possible.</p>

<p>Best regards,<br>QuickDesk Support Team</p>
    `

    await sendEmail({
      to: user.email,
      subject,
      text,
      html,
    })
  } catch (error) {
    console.error("Failed to send ticket created email:", error)
  }
}

const sendTicketStatusEmail = async (ticket, user, oldStatus, newStatus) => {
  try {
    const subject = `Ticket Status Updated: ${ticket.subject}`
    const text = `
Hello ${user.name},

The status of your support ticket has been updated.

Ticket Details:
- Ticket ID: ${ticket.ticketId}
- Subject: ${ticket.subject}
- Previous Status: ${oldStatus}
- New Status: ${newStatus}

You can view your ticket details in the QuickDesk portal.

Best regards,
QuickDesk Support Team
    `

    const html = `
<h2>Ticket Status Updated</h2>
<p>Hello ${user.name},</p>
<p>The status of your support ticket has been updated.</p>

<h3>Ticket Details:</h3>
<ul>
  <li><strong>Ticket ID:</strong> ${ticket.ticketId}</li>
  <li><strong>Subject:</strong> ${ticket.subject}</li>
  <li><strong>Previous Status:</strong> ${oldStatus}</li>
  <li><strong>New Status:</strong> ${newStatus}</li>
</ul>

<p>You can view your ticket details in the QuickDesk portal.</p>

<p>Best regards,<br>QuickDesk Support Team</p>
    `

    await sendEmail({
      to: user.email,
      subject,
      text,
      html,
    })
  } catch (error) {
    console.error("Failed to send ticket status email:", error)
  }
}

module.exports = {
  sendTicketCreatedEmail,
  sendTicketStatusEmail,
}
