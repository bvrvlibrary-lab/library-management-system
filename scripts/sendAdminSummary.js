const { resend } = require("./resendClient");

async function sendAdminSummary(html) {

  try {

    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: "bvrvlibrary@gmail.com",
      subject: "BVRV Library - Overdue Books Summary",
      html,
    });

    console.log("✓ Admin summary email sent");

    return response;

  } catch (error) {

    console.error("✗ Failed to send admin summary");

    console.error(error);

    return null;

  }

}

module.exports = {
  sendAdminSummary,
};
