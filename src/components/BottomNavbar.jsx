'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function BottomNavbar({ user, isAdmin }) {

  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  if (isAdmin) {
    return null;
  }

  return (
    <div className="bottom-navbar">

      {!user ? (
        <>
          <Link
            href="/"
            className={`bottom-item ${pathname === "/" ? "active" : ""}`}
          >
            <div>🏠</div>
            <small>Home</small>
          </Link>

          <Link
            href="/login"
            className={`bottom-item ${pathname === "/login" ? "active" : ""}`}
          >
            <div>🔐</div>
            <small>Sign In</small>
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/"
            className={`bottom-item ${pathname === "/" ? "active" : ""}`}
          >
            <div>🏠</div>
            <small>Home</small>
          </Link>

          <Link
            href="/history"
            className={`bottom-item ${pathname === "/history" ? "active" : ""}`}
          >
            <div>📜</div>
            <small>History</small>
          </Link>

          <Link
            href="/profile"
            className={`bottom-item ${pathname === "/profile" ? "active" : ""}`}
          >
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
        </>
      )}

    </div>
  );
}
