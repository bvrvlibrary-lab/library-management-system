function getAdminSummaryTemplate(summary) {
  const rows = summary
    .map(
      (book) => `
      <tr>
        <td>${book.studentName}</td>
        <td>${book.bookName}</td>
        <td>${book.author}</td>
        <td>${book.daysOverdue}</td>
      </tr>
    `
    )
    .join("");

  return `
  <html>
    <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
      <div style="background:#fff;padding:25px;border-radius:8px;max-width:800px;margin:auto;">
        <h2 style="color:#6f4e37;text-align:center;">
          Bhaktivedanta Rajavidyalaya
        </h2>

        <h3 style="text-align:center;">
          Library Overdue Summary
        </h3>

        <p>The following books reached an overdue milestone today.</p>

        <table
          border="1"
          cellpadding="8"
          cellspacing="0"
          width="100%"
          style="border-collapse:collapse;"
        >
          <tr style="background:#6f4e37;color:white;">
            <th>Student</th>
            <th>Book</th>
            <th>Author</th>
            <th>Days Overdue</th>
          </tr>

          ${rows}

        </table>

        <br>

        <b>Total Students :</b> ${summary.length}

      </div>
    </body>
  </html>
  `;
}

module.exports = {
  getAdminSummaryTemplate,
};
