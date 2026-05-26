import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_nqrgl1q";
const ADMIN_TEMPLATE_ID = "template_gt31z8k";
const STUDENT_TEMPLATE_ID = "template_kxu7165";
const PUBLIC_KEY = "9IRA7CuDhDwkjT4n5";

export const sendAdminEmail = async ({
  to_email,
  subject,
  message,
}) => {
  try {
    await emailjs.send(
      SERVICE_ID,
      ADMIN_TEMPLATE_ID,
      {
        to_email,
        subject,
        message,
      },
      PUBLIC_KEY
    );

    console.log("Admin email sent");
  } catch (error) {
    console.error("Admin email error:", error);
  }
};

export const sendStudentEmail = async ({
  to_email,
  subject,
  message,
}) => {
  try {
    await emailjs.send(
      SERVICE_ID,
      STUDENT_TEMPLATE_ID,
      {
        to_email,
        subject,
        message,
      },
      PUBLIC_KEY
    );

    console.log("Student email sent");
  } catch (error) {
    console.error("Student email error:", error);
  }
};
