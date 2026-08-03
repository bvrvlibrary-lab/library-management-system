'use client';

import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function BottomNavbar({ user }) {
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  if (!user) return null;

  return (
    <div className="bottom-navbar">

      <Link href="/" className="bottom-item">
        <div>🏠</div>
        <small>Home</small>
      </Link>

           <Link href="/history" className="bottom-item">
        <div>📜</div>
        <small>History</small>
      </Link>

      <Link href="/profile" className="bottom-item">
        <div>👤</div>
        <small>Profile</small>
      </Link>

      <button
        onClick={handleLogout}
        className="bottom-item border-0 bg-transparent"
      >
        <div>🚪</div>
        <small>Logout</small>
      </button>

    </div>
  );
}
