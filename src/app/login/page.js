'use client';

import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const router = useRouter();
  const handleForgotPassword =
  async () => {

    if (!email) {
      setMessage(
        'Please enter your email first.'
      );
      return;
    }

    try {
await sendPasswordResetEmail(
  auth,
  email
);;

      setMessage(
  'Password reset link sent. Please check your Inbox or Spam folder.'
);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      // YOUR ADMIN EMAIL
      const adminEmail =
        'bvrvlibrary@gmail.com';

      // ADMIN LOGIN
     if (
  user.email?.toLowerCase() ===
  adminEmail.toLowerCase()
) {
  setMessage(
    'Admin Login Success'
  );

  router.push('/admin/home');
  return;
}
      // STUDENT CHECK
      const userRef = doc(
        db,
        'users',
        user.uid
      );

      const userSnap =
        await getDoc(userRef);

      if (!userSnap.exists()) {
        setMessage(
          'Student record not found.'
        );
        return;
      }

      const userData =
        userSnap.data();

      if (!userData.approved) {
        setMessage(
          'Waiting for admin approval.'
        );
        return;
      }

      setMessage(
        'Student Login Success'
      );

      router.push('/');
    } catch (error) {
      setMessage(
        'Invalid email or password'
      );
    }
  };

  return (
  <div
    style={{
      minHeight: '100vh',
      background:
        'linear-gradient(135deg,#f8f6f2,#eef2f7)',
      paddingTop: '20px'
    }}
  >
<div
  style={{
    maxWidth: '500px',
    margin: '80px auto',
    padding: '35px',
    background: 'white',
    borderRadius: '20px',
    boxShadow:
      '0 10px 30px rgba(0,0,0,0.1)'
  }}
>
     <div
  style={{
    textAlign: 'center',
    marginBottom: '25px'
  }}
>
 <div
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '10px'
  }}
>
  <img
    src="/logo.png"
    alt="BVRV Library"
    width="60"
    height="60"
  />

  <h1
    style={{
      color: '#6f4e37',
      fontWeight: 'bold',
      margin: 0
    }}
  >
    BVRV Library
  </h1>
</div>

  <p
    style={{
      color: '#666',
      margin: 0
    }}
  >
    Welcome Back
  </p>
</div>

      <form onSubmit={handleLogin}>
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

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px',
            background: '#6f4e37',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          Sign In
        </button>
      </form>
<div
  style={{
    textAlign: 'center',
    marginTop: '15px'
  }}
>
  <button
    type="button"
    onClick={handleForgotPassword}
    style={{
      border: 'none',
      background: 'none',
      color: '#6f4e37',
      fontWeight: 'bold',
      cursor: 'pointer'
    }}
  >
    Forgot Password?
  </button>
</div>
      <p style={{ marginTop: '20px' }}>
        New Student?{' '}
        <a href="/signup">
          Register Here
        </a>
      </p>

      {message && (
        <p style={{ marginTop: '20px' }}>
          {message}
        </p>
      )}
    </div>
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
