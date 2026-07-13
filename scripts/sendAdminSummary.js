const { resend } = require("./resendClient");

async function sendAdminSummary(html) {
  const response = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: "bvrvlibrary@gmail.com",
    subject: "BVRV Library - Overdue Books Summary",
    html,
  });

  console.log("✓ Admin summary email sent");

  return response;
}

module.exports = {
  sendAdminSummary,
};
