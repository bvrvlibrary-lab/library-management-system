'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const router = useRouter();

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

        router.push('/');
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
        maxWidth: '500px',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '10px'
      }}
    >
      <h1>Sign In</h1>

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
            background: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px'
          }}
        >
          Sign In
        </button>
      </form>

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
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  borderRadius: '8px',
  border: '1px solid #ccc'
};
