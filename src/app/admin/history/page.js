'use client';

import { useState, useEffect } from 'react';

import { db } from '../../../firebase';

import {
  collection,
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore';

import {
  sendStudentEmail
} from '../../../lib/sendEmail';

export default function AdminHistoryPage() {
  const [activeTab, setActiveTab] =
    useState('approvalpending');
  const [students, setStudents] =
  useState([]);

const [searchTerm, setSearchTerm] =
  useState('');
useEffect(() => {
  const unsubscribe =
    onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setStudents(
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );

  return () => unsubscribe();
}, []);

const handleApproveStudent =
  async (student) => {
    try {
      await updateDoc(
        doc(
          db,
          'users',
          student.id
        ),
        {
          approved: true
        }
      );

      await sendStudentEmail({
        to_email:
          student.email,
        subject:
          'Library Account Approved',
        message: `
Your library account has been approved.

You can now login and request books.
        `
      });

      alert(
        'Student approved'
      );
    } catch (err) {
      console.error(err);
      alert(
        'Approval failed'
      );
    }
  };

const pendingStudents =
  students.filter(
    (student) =>
      !student.approved &&
      (
        student.fullName
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        student.mobile
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
      )
  );
  return (
    <div className="container mt-4">

      <h3 className="mb-4">
        Admin History
      </h3>

      <div className="row">

        <div className="col-md-3">

          <div className="list-group">

            <button
              className={`list-group-item list-group-item-action ${
                activeTab ===
                'approvalpending'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'approvalpending'
                )
              }
            >
              Approval Pending
            </button>

            <button
              className={`list-group-item list-group-item-action ${
                activeTab ===
                'registrationapproval'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'registrationapproval'
                )
              }
            >
              Registration Approval
            </button>

          </div>

        </div>

        <div className="col-md-9">

          {activeTab ===
            'approvalpending' && (
            <div className="card p-3">
              Approval Pending
            </div>
          )}

        {activeTab ===
  'registrationapproval' && (
  <div>

    <div className="card p-3 mb-3">

      <input
        type="text"
        className="form-control"
        placeholder="Search by Name or Mobile"
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(
            e.target.value
          )
        }
      />

    </div>

    <div className="card p-3">

      <h4 className="mb-3">
        Registration Approval
      </h4>

      <div className="table-responsive">

        <table className="table table-bordered">

          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Temple</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {pendingStudents.map(
              (student) => (
                <tr
                  key={
                    student.id
                  }
                >
                  <td>
                    {
                      student.fullName
                    }
                  </td>

                  <td>
                    {
                      student.email
                    }
                  </td>

                  <td>
                    {
                      student.mobile
                    }
                  </td>

                  <td>
                    {
                      student.temple
                    }
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        handleApproveStudent(
                          student
                        )
                      }
                      className="btn btn-success btn-sm"
                    >
                      Approve
                    </button>
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  </div>
)}

        </div>

      </div>

    </div>
  );
}
