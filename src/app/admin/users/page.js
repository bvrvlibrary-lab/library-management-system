'use client';

import { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(
      collection(db, 'users')
    );

    const userList = [];

    querySnapshot.forEach((document) => {
      userList.push({
        id: document.id,
        ...document.data()
      });
    });

    setUsers(userList);
  };

  const approveUser = async (id) => {
    const userRef = doc(db, 'users', id);

    await updateDoc(userRef, {
      approved: true
    });

    alert('Student approved');
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <h1>Student Approval Panel</h1>

      {users.map((user) => (
        <div
          key={user.id}
          style={{
            border: '1px solid #ccc',
            padding: '15px',
            marginBottom: '10px'
          }}
        >
          <h3>{user.fullName}</h3>
          <p>{user.email}</p>
          <p>
            Status:{' '}
            {user.approved
              ? 'Approved'
              : 'Pending'}
          </p>

          {!user.approved && (
            <button
              onClick={() =>
                approveUser(user.id)
              }
            >
              Approve Student
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
