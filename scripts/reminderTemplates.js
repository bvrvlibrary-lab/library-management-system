function getStudentReminderTemplate(student, reminderType, daysOverdue = 0) {

  let title = "";
  let message = "";

  if (reminderType === "dueToday") {
    title = "Book Due Today";
    message = "This is a friendly reminder that your library book is due today. Please return or renew it to avoid overdue reminders.";
  } else {
    title = "Book Overdue";
    message = `Your library book is overdue by <strong>${daysOverdue} day(s)</strong>. Please return or renew it as soon as possible.`;
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:8px;padding:30px;">

      <h2 style="color:#6f4e37;text-align:center;">
        Bhaktivedanta Rajavidyalaya
      </h2>

      <h3 style="text-align:center;">
        Library Management System
      </h3>

      <hr>

      <p>Dear <strong>${student.studentName}</strong>,</p>

      <p>${message}</p>

      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;">
        <tr>
          <td><strong>Book</strong></td>
          <td>${student.bookName}</td>
        </tr>

        <tr>
          <td><strong>Author</strong></td>
          <td>${student.author}</td>
        </tr>

        <tr>
          <td><strong>Language</strong></td>
          <td>${student.language}</td>
        </tr>

        <tr>
          <td><strong>Due Date</strong></td>
          <td>${student.dueDate.toDate().toDateString()}</td>
        </tr>
      </table>

      <br>

      <p>
        Kindly return or renew the book at the earliest.
      </p>

      <br>

      <p>
        Regards,<br>
        <strong>BVRV Library</strong>
      </p>

    </div>
  </body>
  </html>
  `;
}

module.exports = {
  getStudentReminderTemplate,
};
