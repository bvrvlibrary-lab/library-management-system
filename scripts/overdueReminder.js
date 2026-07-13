const { db } = require("./firebaseAdmin");
const { getReminderType } = require("./reminderLogic");
const { sendStudentReminder } = require("./sendStudentReminder");
const { getStudentReminderTemplate } = require("./reminderTemplates");

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

for (const doc of snapshot.docs) {

  const data = doc.data();
const lastStudentReminderDate =
  data.lastStudentReminderDate || null;

const lastStudentReminderType =
  data.lastStudentReminderType || null;

const adminReminderHistory =
  data.adminReminderHistory || [];

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
  const reminder = getReminderType(
  daysRemaining,
  daysOverdue
);
 const todayString = today.toISOString().split("T")[0];

const studentReminderAlreadySent =
  lastStudentReminderDate === todayString;

const adminReminderAlreadySent =
  adminReminderHistory.includes(daysOverdue);
if (reminder && !studentReminderAlreadySent) {

  const subject =
    reminder.studentReminder === "dueToday"
      ? "BVRV Library - Book Due Today"
      : "BVRV Library - Overdue Book Reminder";

  console.log("Student Reminder :", reminder.studentReminder);
  if (
  reminder.notifyAdmin &&
  !adminReminderAlreadySent
) {
  console.log(
    `Admin Summary: Add ${data.studentName} (${daysOverdue} days overdue)`
  );
}

  const html = getStudentReminderTemplate(
    data,
    reminder.studentReminder,
    daysOverdue
  );

  await sendStudentReminder(
    data,
    subject,
    html
  );

await doc.ref.update({
  lastStudentReminderDate: todayString,
  lastStudentReminderType: reminder.studentReminder,
});
  
} else if (studentReminderAlreadySent) {

  console.log("Today's reminder already sent.");

} else {

  console.log("No Reminder Required");

}
  
  console.log("---------------------------------");
  console.log("Student :", data.studentName);
  console.log("Book    :", data.bookName);
  console.log("Due Date:", dueDate.toDateString());
  console.log("Days Remaining :", daysRemaining);
  console.log("Days Overdue   :", daysOverdue);
 
}
    console.log("---------------------------------");
    console.log("Firestore Connected Successfully");

  } catch (error) {

    console.error(error);

    process.exit(1);

  }
}

checkFirestore();
