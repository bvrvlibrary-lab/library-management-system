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

  console.log("---------------------------------");
  console.log("Document ID :", doc.id);
  console.log("Raw Status  :", JSON.stringify(data.status));
  console.log("Student     :", data.studentName);
  console.log("Book        :", data.bookName);
});

    console.log("---------------------------------");
    console.log("Firestore Connected Successfully");

  } catch (error) {

    console.error(error);

    process.exit(1);

  }
}

checkFirestore();
