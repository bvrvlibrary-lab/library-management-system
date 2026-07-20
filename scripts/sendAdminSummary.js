const { resend } = require("./resendClient");

async function sendAdminSummary(html) {

  try {

    const subject =
      `BVRV Library - Overdue Books Summary (${new Date().toLocaleDateString("en-IN")})`;

    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [
  "bvrvlibrary@gmail.com",
  "hod.bvrvpune@gmail.com"
],
      subject,
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
