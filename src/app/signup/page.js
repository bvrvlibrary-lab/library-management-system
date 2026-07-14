'use client';

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { auth, db } from '../../firebase';
import { sendAdminEmail } from '../../lib/sendEmail';

export default function SignupPage() {

  const [fullName, setFullName] = useState('');
  const [initiatedName, setInitiatedName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [counselorName, setCounselorName] = useState('');
  const [counselorMobile, setCounselorMobile] = useState('');
  const [temple, setTemple] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {

    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("❌ Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);

    try {

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;
      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {

        fullName,
        initiatedName,
        mobile,
        email,
        counselorName,
        counselorMobile,
        temple,

        role: 'student',

        approved: false,

        createdAt: new Date()

      });

      await sendAdminEmail({

        to_email: 'bvrvlibrary@gmail.com',

        subject: 'New Student Registration',

        message: `

A new student registered and is waiting for approval.

Full Name: ${fullName}

Initiated Name: ${initiatedName}

Mobile: ${mobile}

Email: ${email}

Counselor Name: ${counselorName}

Counselor Mobile: ${counselorMobile}

Temple: ${temple}

`

      });

      setMessage(
  "✅ Registration successful. A verification email has been sent to your email address. Please verify your email first. After verification, your account will be reviewed by the library administrator."
);

      setFullName('');
      setInitiatedName('');
      setMobile('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCounselorName('');
      setCounselorMobile('');
      setTemple('');

    }

    catch (error) {

      setMessage(error.message);

    }

    finally {

      setLoading(false);

    }

  };
  return (
  <div
    style={{
      minHeight: "100vh",
      background: "#f5f3ef",
      padding: "50px 15px"
    }}
  >
    <div
      style={{
        maxWidth: "750px",
        margin: "0 auto",
        background: "#fff",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)"
      }}
    >
      {/* Header */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#6f4e37,#8b5e3c)",
          color: "white",
          padding: "35px",
          textAlign: "center"
        }}
      >
        <h1
          style={{
            marginBottom: "10px",
            fontWeight: "700"
          }}
        >
          📚 BVRV Library Registration
        </h1>

        <p
          style={{
            margin: 0,
            opacity: 0.95,
            fontSize: "16px"
          }}
        >
          Create your library account to request and borrow books.
        </p>
      </div>

      <div style={{ padding: "35px" }}>

        <form onSubmit={handleSignup}>

          <h4
            style={{
              color: "#6f4e37",
              marginBottom: "20px"
            }}
          >
            Personal Information
          </h4>

          <input
            type="text"
            placeholder="👤 Full Name *"
            required
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="🪔 Initiated Name (Optional)"
            value={initiatedName}
            onChange={(e) =>
              setInitiatedName(e.target.value)
            }
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="📱 Mobile Number *"
            required
            value={mobile}
            onChange={(e) =>
              setMobile(e.target.value)
            }
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="📧 Email Address *"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={inputStyle}
          />

          <h4
            style={{
              color: "#6f4e37",
              margin:
                "35px 0 20px"
            }}
          >
            Account Security
          </h4>

          <div
            style={{
              position: "relative"
            }}
          >
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="🔒 Password *"
              required
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <span
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              style={{
                position: "absolute",
                right: "15px",
                top: "14px",
                cursor: "pointer"
              }}
            >
              {showPassword
                ? "🙈"
                : "👁"}
            </span>
          </div>

          <div
            style={{
              position: "relative"
            }}
          >
            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="🔐 Confirm Password *"
              required
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <span
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              style={{
                position: "absolute",
                right: "15px",
                top: "14px",
                cursor: "pointer"
              }}
            >
              {showConfirmPassword
                ? "🙈"
                : "👁"}
            </span>
          </div>

          <h4
            style={{
              color: "#6f4e37",
              margin:
                "35px 0 20px"
            }}
          >
            Temple Information
          </h4>

          <input
            type="text"
            placeholder="🏛 Temple Name / Affiliation *"
            required
            value={temple}
            onChange={(e) =>
              setTemple(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="👨 Counselor Name *"
            required
            value={counselorName}
            onChange={(e) =>
              setCounselorName(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="📞 Counselor Mobile Number *"
            required
            value={counselorMobile}
            onChange={(e) =>
              setCounselorMobile(
                e.target.value
              )
            }
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading
              ? "⏳ Creating Account..."
              : "📚 Register Account"}
          </button>

        </form>

        {message && (
          <div
            style={{
              marginTop: "25px",
              padding: "15px 20px",
              borderRadius: "10px",
              background: message.startsWith("✅")
                ? "#d1e7dd"
                : "#f8d7da",
              color: message.startsWith("✅")
                ? "#0f5132"
                : "#842029",
              border: `1px solid ${
                message.startsWith("✅")
                  ? "#badbcc"
                  : "#f5c2c7"
              }`
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            borderTop: "1px solid #eee",
            paddingTop: "20px"
          }}
        >
          Already have an account?

          <br />

          <Link
            href="/login"
            style={{
              color: "#6f4e37",
              fontWeight: "700",
              textDecoration: "none",
              fontSize: "17px"
            }}
          >
            Login Here
          </Link>

        </div>

      </div>

    </div>

  </div>
);

}

const inputStyle = {

  width: "100%",

  padding: "14px 16px",

  marginBottom: "18px",

  borderRadius: "10px",

  border: "1px solid #ced4da",

  fontSize: "15px",

  outline: "none",

  transition: "0.3s"

};

const buttonStyle = {

  width: "100%",

  padding: "15px",

  marginTop: "15px",

  background:
    "linear-gradient(135deg,#6f4e37,#8b5e3c)",

  color: "#fff",

  border: "none",

  borderRadius: "10px",

  fontSize: "18px",

  fontWeight: "700",

  cursor: "pointer",

  boxShadow:
    "0 6px 18px rgba(111,78,55,0.25)"
};

