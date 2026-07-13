const { resend } = require("./resendClient");

async function sendStudentReminder(student, subject, html) {

  try {

   const response = await resend.emails.send({
  from: process.env.FROM_EMAIL,
  to: student.studentEmail,
  subject,
  html,
});

console.log("========== RESEND RESPONSE ==========");
console.log(JSON.stringify(response, null, 2));
console.log("=====================================");

    console.log(
      `✓ Student reminder sent to ${student.studentEmail}`
    );

    return response;

  } catch (error) {

    console.error(
      `✗ Failed to send reminder to ${student.studentEmail}`
    );

    console.error(error);

    return null;

  }

}

module.exports = {
  sendStudentReminder,
};
