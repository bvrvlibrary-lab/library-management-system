const { sendAdminSummary } = require("./sendAdminSummary");
const { getAdminSummaryTemplate } = require("./adminSummaryTemplate");
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

    const adminSummary = [];

    const snapshot = await db
      .collection("bookRequests")
      .where("status", "==", "Issued")
      .get();

    console.log(`Total Book Requests: ${snapshot.size}`);

    for (const doc of snapshot.docs) {

      const data = doc.data();

      // Get latest student details
if (data.studentId) {
  const studentDoc = await db
    .collection("users")
    .doc(data.studentId)
    .get();

  if (studentDoc.exists) {
    const studentData = studentDoc.data();

    data.studentName =
      studentData.initiatedName?.trim() ||
      studentData.fullName ||
      data.studentName;
  }
}

      let lastStudentReminderDate = null;

if (data.lastStudentReminderDate) {

  if (typeof data.lastStudentReminderDate === "string") {

    lastStudentReminderDate = data.lastStudentReminderDate;

  } else {

    lastStudentReminderDate =
      data.lastStudentReminderDate
        .toDate()
        .toISOString()
        .split("T")[0];

  }

}

      const adminReminderHistory =
        data.adminReminderHistory || [];

      if (!data.bookName || !data.studentEmail || !data.dueDate) {
        console.log("---------------------------------");
        console.log(`Skipping invalid record (${doc.id})`);
        continue;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueDate = data.dueDate.toDate();
      dueDate.setHours(0, 0, 0, 0);

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

      const todayString =
        new Date().toISOString().split("T")[0];

      const studentReminderAlreadySent =
        lastStudentReminderDate === todayString;

      const adminReminderAlreadySent =
        adminReminderHistory.includes(daysOverdue);

      if (reminder && !studentReminderAlreadySent) {

        const subject =
          reminder.studentReminder === "dueToday"
            ? "BVRV Library - Book Due Today"
            : "BVRV Library - Overdue Book Reminder";

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
          lastStudentReminderDate: new Date(),
          lastStudentReminderType: reminder.studentReminder,
        });

        if (
          reminder.notifyAdmin &&
          !adminReminderAlreadySent
        ) {

          adminSummary.push({
            studentName: data.studentName,
            bookName: data.bookName,
            author: data.author,
            daysOverdue,
          });

          await doc.ref.update({
            adminReminderHistory: [
              ...adminReminderHistory,
              daysOverdue,
            ],
          });

        }

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

    console.log(`Admin Summary Count : ${adminSummary.length}`);

    if (adminSummary.length > 0) {

      const html =
        getAdminSummaryTemplate(adminSummary);

      await sendAdminSummary(html);

    }

    console.log("---------------------------------");
    console.log("Firestore Connected Successfully");

  } catch (error) {

    console.error(error);
    process.exit(1);

  }
}

checkFirestore();
