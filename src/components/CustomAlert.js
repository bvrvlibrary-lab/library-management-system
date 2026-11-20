'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatErrorMessage } from '../lib/errorHandler';

const AlertContext = createContext({
  showAlert: () => {},
  closeAlert: () => {},
});

export function AlertProvider({ children }) {
  const [alertData, setAlertData] = useState(null);

  const showAlert = useCallback((msg, options = {}) => {
    if (!msg) return;
    const cleanMessage = formatErrorMessage(msg);
    const title = options?.title || (options?.type === 'error' ? 'Notice' : 'Hare Krishna 🙏');
    const type = options?.type || 'info';
    setAlertData({ message: cleanMessage, title, type });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertData(null);
  }, []);

  // Safe client-side interceptor so legacy window.alert calls show nicely in the middle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalAlert = window.alert;
      window.alert = (msg) => {
        showAlert(msg);
      };
      return () => {
        window.alert = originalAlert;
      };
    }
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      {alertData && (
        <CustomAlert
          message={alertData.message}
          title={alertData.title}
          type={alertData.type}
          onClose={closeAlert}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}

export default function CustomAlert({
  message,
  title = 'Hare Krishna 🙏',
  type = 'info',
  onClose,
}) {
  if (!message) return null;

  const displayMessage = formatErrorMessage(message);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
        padding: '20px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '420px',
          padding: '28px 24px',
          borderRadius: '24px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
          border: '1px solid #ebdcd0',
          position: 'relative',
          animation: 'scaleUp 0.2s ease-out',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: type === 'error' ? '#fde8e8' : '#f5ebe1',
            color: type === 'error' ? '#c81e1e' : '#6f4e37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '26px',
          }}
        >
          {type === 'error' ? '⚠️' : type === 'success' ? '✅' : '📖'}
        </div>

        <h3
          style={{
            color: '#6f4e37',
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 12px 0',
            letterSpacing: '0.2px',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            color: '#3d312a',
            fontSize: '15px',
            lineHeight: '1.6',
            margin: '0 0 24px 0',
            wordBreak: 'break-word',
          }}
        >
          {displayMessage}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            style={{
              backgroundColor: '#6f4e37',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 36px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(111, 78, 55, 0.35)',
              transition: 'all 0.2s ease',
              minWidth: '130px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#5c3f2c')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6f4e37')}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
