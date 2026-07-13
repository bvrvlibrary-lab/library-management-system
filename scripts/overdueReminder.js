const { db } = require("./firebaseAdmin");

async function checkFirestore() {
  try {

    console.log("=================================");
    console.log("VERSION 2 - Issued Filter Enabled");
    console.log("BVRV Library Reminder System");
    console.log("=================================");

 const snapshot = await db
  .collection("bookRequests")
  .where("status", "==", "Issued")
  .get();

    console.log(
      `Total Book Requests: ${snapshot.size}`
    );

snapshot.forEach((doc) => {

  const data = doc.data();

  // Skip invalid test records
  if (!data.bookName || !data.studentEmail || !data.dueDate) {
    console.log("---------------------------------");
    console.log(`Skipping invalid record (${doc.id})`);
    return;
  }

  // Today's date
  const today = new Date();

  // Remove time portion (00:00:00)
  today.setHours(0, 0, 0, 0);

  // Due date
  const dueDate = data.dueDate.toDate();

  // Remove time portion
  dueDate.setHours(0, 0, 0, 0);

  // Difference in days
  const diffTime = dueDate.getTime() - today.getTime();

  const daysRemaining = Math.floor(
    diffTime / (1000 * 60 * 60 * 24)
  );

  const daysOverdue =
    daysRemaining < 0
      ? Math.abs(daysRemaining)
      : 0;

  console.log("---------------------------------");
  console.log("Student :", data.studentName);
  console.log("Book    :", data.bookName);
  console.log("Due Date:", dueDate.toDateString());
  console.log("Days Remaining :", daysRemaining);
  console.log("Days Overdue   :", daysOverdue);

});

    console.log("---------------------------------");
    console.log("Firestore Connected Successfully");

  } catch (error) {

    console.error(error);

    process.exit(1);

  }
}

checkFirestore();
