'use client';

import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar({
  isAdmin,
  user
}) {
  const handleLogout = async () => {
  await signOut(auth);

  window.location.href = '/login';
};
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">

        <Link
          href="/"
          className="navbar-brand fw-bold"
        >
          LMS Portal
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">

            <li className="nav-item">
              <Link
                href="/"
                className="nav-link"
              >
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                href="/books"
                className="nav-link"
              >
                Library Books
              </Link>
            </li>

            {!user && (
              <li className="nav-item">
                <Link
                  href="/login"
                  className="nav-link"
                >
                  Login
                </Link>
              </li>
            )}

            {isAdmin && (
              {user && (
  <li className="nav-item">
    <button
      onClick={handleLogout}
      className="btn btn-danger btn-sm ms-3"
    >
      Logout
    </button>
  </li>
)}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  Admin
                </a>

                <ul className="dropdown-menu">

                  <li>
                    <Link
                      href="/admin/dashboard"
                      className="dropdown-item"
                    >
                      Dashboard
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/admin/students"
                      className="dropdown-item"
                    >
                      Student Approval
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/admin/history"
                      className="dropdown-item"
                    >
                      Books History
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/admin/issued"
                      className="dropdown-item"
                    >
                      Issued Books
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/admin/returned"
                      className="dropdown-item"
                    >
                      Returned Books
                    </Link>
                  </li>

                </ul>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}
