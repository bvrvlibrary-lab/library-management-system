'use client';

import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar({ isAdmin, user }) {
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
   <nav
  className="navbar navbar-expand-lg shadow-sm"
  style={{
    background:
      'linear-gradient(90deg,#0f172a,#1e3a8a)'
  }}
>
      <div className="container-fluid">

        {/* Logo / Brand */}
        <Link href="/" className="navbar-brand fw-bold">
          📚 BVRV Library
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Content */}
        <div className="collapse navbar-collapse" id="navbarContent">

          {/* Left Side */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

         {/* Public / Student Home */}
{!isAdmin && (
  <li className="nav-item">
    <Link href="/" className="nav-link">
      Home
    </Link>
  </li>
)}

         {/* Student Links */}
{!isAdmin && user && (
  <>
    <li className="nav-item">
      <Link href="/history" className="nav-link">
        Book History
      </Link>
    </li>

    <li className="nav-item">
      <Link href="/profile" className="nav-link">
        Profile
      </Link>
    </li>
  </>
)}

          {/* Admin Links */}
{isAdmin && (
  <>
    <li className="nav-item">
      <Link
        href="/admin/home"
        className="nav-link"
      >
        Home
      </Link>
    </li>

    <li className="nav-item">
      <Link
        href="/admin/history"
        className="nav-link"
      >
        History
      </Link>
    </li>
  </>
)}
          </ul>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-3">

            {/* User Email */}
            {user && (
              <span className="text-light small">
                {user.email}
              </span>
            )}

            {/* Logout */}
            {user && (
              <button
                onClick={handleLogout}
                className="btn btn-outline-light btn-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
