'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import {
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';

import { db, auth } from '../../firebase';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [temple, setTemple] = useState('');
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const docRef = doc(
        db,
        'users',
        user.uid
      );

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setFullName(data.fullName || '');
        setMobile(data.mobile || '');
        setTemple(data.temple || '');
        setEmail(data.email || '');
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      await updateDoc(
        doc(db, 'users', user.uid),
        {
          fullName,
          mobile,
          temple
        }
      );

      alert('Profile updated successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    try {
      const user = auth.currentUser;

      if (!user) return;

      if (
        newPassword !== confirmPassword
      ) {
        return alert(
          'New password and confirm password do not match'
        );
      }

      const credential =
        EmailAuthProvider.credential(
          user.email,
          currentPassword
        );

      await reauthenticateWithCredential(
        user,
        credential
      );

      await updatePassword(
        user,
        newPassword
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      alert(
        'Password changed successfully'
      );
    } catch (error) {
      console.error(error);
      alert(
        'Current password is incorrect'
      );
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        Loading...
      </div>
    );
  }

 return (
  <>
    <Navbar
      isAdmin={false}
      user={auth.currentUser}
    />

    <div className="container mt-4">
  

      <h3 className="mb-4">
        Profile
      </h3>

      <div className="card p-4 mb-4">

        <div className="mb-3">
          <label className="form-label">
            Full Name
          </label>

          <input
            type="text"
            className="form-control"
            value={fullName}
            onChange={(e) =>
              setFullName(
                e.target.value
              )
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Mobile
          </label>

          <input
            type="text"
            className="form-control"
            value={mobile}
            onChange={(e) =>
              setMobile(
                e.target.value
              )
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Temple
          </label>

          <input
            type="text"
            className="form-control"
            value={temple}
            onChange={(e) =>
              setTemple(
                e.target.value
              )
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Email
          </label>

          <input
            type="email"
            className="form-control"
            value={email}
            disabled
          />
        </div>

        <button
          onClick={handleSaveProfile}
          className="btn btn-primary"
        >
          Save Profile
        </button>
      </div>

      <div className="card p-4">

        <h4 className="mb-3">
          Change Password
        </h4>

        <div className="mb-3">
          <label className="form-label">
            Current Password
          </label>

          <input
            type="password"
            className="form-control"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(
                e.target.value
              )
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            New Password
          </label>

          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Confirm Password
          </label>

          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
          />
        </div>

        <button
          onClick={handleChangePassword}
          className="btn btn-warning"
        >
          Change Password
        </button>

      </div>
      </div>
          </>
  );
}
