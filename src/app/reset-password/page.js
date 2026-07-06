'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
import { auth } from '../../firebase';

export default function ResetPasswordPage() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [validCode, setValidCode] =
    useState(false);

  useEffect(() => {

    if (!oobCode) {
      setMessage(
        'Invalid or expired password reset link.'
      );
      return;
    }

    verifyPasswordResetCode(
      auth,
      oobCode
    )
      .then(() => {
        setValidCode(true);
      })
      .catch(() => {
        setMessage(
          'This password reset link is invalid or has expired.'
        );
      });

  }, [oobCode]);

  const handleResetPassword =
    async (e) => {

      e.preventDefault();

      if (
        password !==
        confirmPassword
      ) {

        setMessage(
          'Passwords do not match.'
        );

        return;
      }

      if (
        password.length < 6
      ) {

        setMessage(
          'Password must contain at least 6 characters.'
        );

        return;
      }

      try {

        setLoading(true);

        await confirmPasswordReset(
          auth,
          oobCode,
          password
        );

        setMessage(
          'Password changed successfully! Redirecting to Login...'
        );

        setTimeout(() => {

          router.push('/login');

        }, 2500);

      } catch (error) {

        setMessage(
          error.message
        );

      } finally {

        setLoading(false);

      }

    };
    return (

    <div
      className="container py-5"
      style={{
        maxWidth: "500px"
      }}
    >

      <div className="card shadow-lg border-0">

        <div
          className="card-header text-white text-center"
          style={{
            background:
              "linear-gradient(135deg,#6f4e37,#8b5e3c)"
          }}
        >

          <h3 className="mb-1">
            🔒 Reset Password
          </h3>

          <small>
            BVRV Library Management System
          </small>

        </div>

        <div className="card-body p-4">

          {!validCode ? (

            <div
              className="alert alert-danger"
            >
              {message}
            </div>

          ) : (

            <form
              onSubmit={
                handleResetPassword
              }
            >

              <div className="mb-3">

                <label className="form-label fw-bold">
                  New Password
                </label>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className="form-control"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="mb-3">

                <label className="form-label fw-bold">
                  Confirm Password
                </label>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="form-check mb-3">

                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={showPassword}
                  onChange={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  id="showPassword"
                />

                <label
                  htmlFor="showPassword"
                  className="form-check-label"
                >
                  Show Password
                </label>

              </div>

              {message && (

                <div
                  className={
                    message.includes(
                      "successfully"
                    )
                      ? "alert alert-success"
                      : "alert alert-danger"
                  }
                >
                  {message}
                </div>

              )}

              <button
                type="submit"
                className="btn btn-success w-100 py-2"
                disabled={loading}
              >

                {loading
                  ? "Updating..."
                  : "Reset Password"}

              </button>

            </form>

          )}

        </div>

      </div>

    </div>

  );

}
