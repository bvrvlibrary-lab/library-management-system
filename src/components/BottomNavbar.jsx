'use client';

import React from 'react';
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
    <nav
      className="bottom-navbar d-md-none"
      role="navigation"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: '66px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #ebdcd0',
        boxShadow: '0 -4px 20px rgba(78, 52, 46, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1030,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {!user ? (
        <>
          <Link
            href="/"
            className={`bottom-item ${pathname === '/' ? 'active' : ''}`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: pathname === '/' ? '#6f4e37' : '#8c7b72',
              fontWeight: pathname === '/' ? '700' : '500',
              fontSize: '11px',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                backgroundColor: pathname === '/' ? '#f5ebe1' : 'transparent',
                color: pathname === '/' ? '#6f4e37' : '#8c7b72',
                marginBottom: '2px',
              }}
            >
              <i className="bi bi-house-door-fill"></i>
            </div>
            <span>Catalog</span>
          </Link>

          <Link
            href="/login"
            className={`bottom-item ${pathname === '/login' ? 'active' : ''}`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: pathname === '/login' ? '#6f4e37' : '#8c7b72',
              fontWeight: pathname === '/login' ? '700' : '500',
              fontSize: '11px',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                backgroundColor: pathname === '/login' ? '#f5ebe1' : 'transparent',
                color: pathname === '/login' ? '#6f4e37' : '#8c7b72',
                marginBottom: '2px',
              }}
            >
              <i className="bi bi-box-arrow-in-right"></i>
            </div>
            <span>Sign In</span>
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/"
            className={`bottom-item ${pathname === '/' ? 'active' : ''}`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: pathname === '/' ? '#6f4e37' : '#8c7b72',
              fontWeight: pathname === '/' ? '700' : '500',
              fontSize: '11px',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                backgroundColor: pathname === '/' ? '#f5ebe1' : 'transparent',
                color: pathname === '/' ? '#6f4e37' : '#8c7b72',
                marginBottom: '2px',
              }}
            >
              <i className="bi bi-book-fill"></i>
            </div>
            <span>Books</span>
          </Link>

          <Link
            href="/history"
            className={`bottom-item ${pathname === '/history' ? 'active' : ''}`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: pathname === '/history' ? '#6f4e37' : '#8c7b72',
              fontWeight: pathname === '/history' ? '700' : '500',
              fontSize: '11px',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                backgroundColor: pathname === '/history' ? '#f5ebe1' : 'transparent',
                color: pathname === '/history' ? '#6f4e37' : '#8c7b72',
                marginBottom: '2px',
              }}
            >
              <i className="bi bi-clock-history"></i>
            </div>
            <span>My History</span>
          </Link>

          <Link
            href="/profile"
            className={`bottom-item ${pathname === '/profile' ? 'active' : ''}`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: pathname === '/profile' ? '#6f4e37' : '#8c7b72',
              fontWeight: pathname === '/profile' ? '700' : '500',
              fontSize: '11px',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                backgroundColor: pathname === '/profile' ? '#f5ebe1' : 'transparent',
                color: pathname === '/profile' ? '#6f4e37' : '#8c7b72',
                marginBottom: '2px',
              }}
            >
              <i className="bi bi-person-circle"></i>
            </div>
            <span>Profile</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="bottom-item border-0 bg-transparent"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a33a30',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                backgroundColor: '#fde8e8',
                color: '#c81e1e',
                marginBottom: '2px',
              }}
            >
              <i className="bi bi-box-arrow-right"></i>
            </div>
            <span>Logout</span>
          </button>
        </>
      )}
    </nav>
  );
}
