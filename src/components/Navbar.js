'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    'linear-gradient(90deg,#4e342e,#6d4c41)'
}}
>
      <div className="container-fluid">

        {/* Logo / Brand */}
        <Link
  href="/"
  className="navbar-brand d-flex align-items-center"
>

  <Image
    src="/logo.png"
    alt="BVRV Library"
    width={60}
    height={60}
  />

  <span
    className="ms-3 fw-bold"
    style={{
      color: '#F4E4BC',
      fontSize: '1.4rem'
    }}
  >
    Bhaktivedanta Rajavidyalaya Library
  </span>

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

         {/* Public / Student  */}
{!isAdmin && (
  <li className="nav-item">
    <Link
  href="/"
  className="nav-link text-light fw-semibold"
>
  Home
</Link>
  </li>
)}

         {/* Student Links */}
{!isAdmin && user && (
  <>
    <li className="nav-item">
      <Link href="/history" className="nav-link text-light fw-semibold">
        Book History
      </Link>
    </li>

    <li className="nav-item">
      <Link href="/profile" className="nav-link text-light fw-semibold">
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
        className="nav-link text-light fw-semibold"
      >
        Home
      </Link>
    </li>

    <li className="nav-item">
      <Link
        href="/admin/history"
        className="nav-link text-light fw-semibold"
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
              <span className="text-warning small fw-semibold">
                {user.email}
              </span>
            )}

            {/* Logout */}
            {user && (
              <button
                onClick={handleLogout}
                className="btn btn-warning btn-sm fw-semibold"
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
