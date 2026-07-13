const { resend } = require("./resendClient");

async function sendStudentReminder(student, subject, html) {
  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: student.studentEmail,
      subject,
      html,
    });

    console.log(
      `✓ Reminder email sent to ${student.studentEmail}`
    );

    return response;

  } catch (error) {

    console.error(
      `✗ Failed to send email to ${student.studentEmail}`
    );

    console.error(error);

    throw error;
  }
}

module.exports = {
  sendStudentReminder,
};
