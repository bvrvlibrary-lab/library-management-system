function getStudentReminderTemplate(student, reminderType, daysOverdue = 0) {

  const dueDate = student.dueDate.toDate().toDateString();

  let heading = "";
  let message = "";
  let color = "#2E7D32";

  if (reminderType === "dueToday") {

    heading = "📚 Book Due Today";

    message = `
      This is a friendly reminder that the following library book is due today.
      Kindly return or renew the book to avoid overdue reminders.
    `;

    color = "#F57C00";

  } else {

    heading = "⚠️ Overdue Book Reminder";

    message = `
      The following library book is overdue by
      <strong>${daysOverdue} day(s)</strong>.
      Kindly return or renew the book immediately.
    `;

    color = "#C62828";

  }

  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
</head>

<body style="margin:0;padding:30px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="700" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">

<tr>
<td style="background:#6f4e37;color:#ffffff;padding:20px;text-align:center;">
<h2 style="margin:0;">Bhaktivedanta Rajavidyalaya</h2>
<div>Library Management System</div>
</td>
</tr>

<tr>
<td style="padding:30px;">

<h2 style="color:${color};margin-top:0;">
${heading}
</h2>

<p>
Dear <strong>${student.studentName}</strong>,
</p>

<p>
${message}
</p>

<table
width="100%"
cellpadding="10"
cellspacing="0"
style="border-collapse:collapse;border:1px solid #ddd;">

<tr>
<td style="background:#f5f5f5;"><strong>Book</strong></td>
<td>${student.bookName}</td>
</tr>

<tr>
<td style="background:#f5f5f5;"><strong>Author</strong></td>
<td>${student.author}</td>
</tr>

<tr>
<td style="background:#f5f5f5;"><strong>Language</strong></td>
<td>${student.language}</td>
</tr>

<tr>
<td style="background:#f5f5f5;"><strong>Due Date</strong></td>
<td>${dueDate}</td>
</tr>

</table>

<p style="margin-top:25px;">
Please visit the BVRV Office, if you wish to renew this book or send Whatsapp Message or Call to +91-9175295571
</p>

<p>
Thank you.
</p>

<br>

<p>
Regards,<br>
<strong>BVRV Library</strong><br>
Bhaktivedanta Rajavidyalaya
</p>

</td>
</tr>

<tr>
<td style="background:#eeeeee;padding:15px;text-align:center;font-size:12px;color:#666;">
This is an automated email from the BVRV Library Management System.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}

module.exports = {
  getStudentReminderTemplate,
};
