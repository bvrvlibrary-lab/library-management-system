'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { sendAdminEmail } from '../../lib/sendEmail';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [initiatedName, setInitiatedName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [counselorName, setCounselorName] = useState('');
  const [counselorMobile, setCounselorMobile] = useState('');
  const [temple, setTemple] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

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
  `,
});
      setMessage(
        'Registration submitted. Waiting for admin approval.'
      );
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '10px'
      }}
    >
      <h1>Student Registration</h1>

      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Full Name"
          required
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Initiated Name (Optional)"
          value={initiatedName}
          onChange={(e) =>
            setInitiatedName(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Mobile Number"
          required
          value={mobile}
          onChange={(e) =>
            setMobile(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Counselor Name"
          required
          value={counselorName}
          onChange={(e) =>
            setCounselorName(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Counselor Mobile Number"
          required
          value={counselorMobile}
          onChange={(e) =>
            setCounselorMobile(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Temple Name / Affiliation"
          required
          value={temple}
          onChange={(e) =>
            setTemple(e.target.value)
          }
          style={inputStyle}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px',
            background: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px'
          }}
        >
          Register
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '20px' }}>
          {message}
        </p>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  borderRadius: '8px',
  border: '1px solid #ccc'
};
