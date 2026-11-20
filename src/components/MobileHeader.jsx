'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MobileHeader({ user, isAdmin }) {
  if (isAdmin) return null;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1020,
        background: 'linear-gradient(135deg, #3d2516 0%, #5d3822 100%)',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.22)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
      }}
      className="d-md-none"
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #D4AF37',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="BVRV Library"
            width={38}
            height={38}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <div style={{ lineHeight: '1.2' }}>
          <div
            style={{
              color: '#FBF3D5',
              fontSize: '17px',
              fontWeight: '700',
              letterSpacing: '0.3px',
            }}
          >
            BVRV Library
          </div>
          <div
            style={{
              color: '#D4AF37',
              fontSize: '10.5px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Bhaktivedanta Rajavidyalaya
          </div>
        </div>
      </Link>

      <div>
        {user ? (
          <Link
            href="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              padding: '6px 12px',
              borderRadius: '9999px',
              textDecoration: 'none',
              color: '#FBF3D5',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            <i className="bi bi-person-circle" style={{ color: '#D4AF37', fontSize: '15px' }}></i>
            <span>{user.displayName || (user.email ? user.email.split('@')[0] : 'Profile')}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #aa841e 100%)',
              color: '#ffffff',
              padding: '7px 16px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: '0 3px 10px rgba(212, 175, 55, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <i className="bi bi-box-arrow-in-right"></i>
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
