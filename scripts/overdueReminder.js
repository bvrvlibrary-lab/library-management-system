const { db } = require("./firebaseAdmin");

async function checkFirestore() {
  try {

    console.log("=================================");
    console.log("BVRV Library Reminder System");
    console.log("=================================");

    const snapshot = await db
      .collection("bookRequests")
      .get();

    console.log(
      `Total Book Requests: ${snapshot.size}`
    );

    snapshot.forEach((doc) => {

      const data = doc.data();

      console.log("---------------------------------");
      console.log("Student :", data.studentName);
      console.log("Book    :", data.bookName);
      console.log("Status  :", data.status);

    });

    console.log("---------------------------------");
    console.log("Firestore Connected Successfully");

  } catch (error) {

    console.error(error);

    process.exit(1);

  }
}

checkFirestore();
