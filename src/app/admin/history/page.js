'use client';
import Navbar from '../../../components/Navbar';
import { useState, useEffect } from 'react';
import { db } from '../../../firebase';

import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  increment
} from 'firebase/firestore';

import {
  sendStudentEmail
} from '../../../lib/sendEmail';

export default function AdminHistoryPage() {

  const [activeTab, setActiveTab] =
    useState('approvalpending');

  const [students, setStudents] =
    useState([]);

  const [requests, setRequests] =
    useState([]);

  
  const [searchTerm, setSearchTerm] =
    useState('');

  const [requestSearch,
    setRequestSearch] =
    useState('');
  const [issuedSearch,
  setIssuedSearch] =
  useState('');
const [issueDays, setIssueDays] =
  useState({});
  const [renewSearch,
  setRenewSearch] =
  useState('');
  const [returnedSearch,
  setReturnedSearch] =
  useState('');
  const [studentSearch,
  setStudentSearch] =
  useState('');
  const [deleteStudentSearch,
  setDeleteStudentSearch] =
  useState('');
  useEffect(() => {

    const unsubscribeStudents =
      onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          setStudents(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }))
          );
        }
      );

    const unsubscribeRequests =
      onSnapshot(
        collection(db, 'bookRequests'),
        (snapshot) => {
          setRequests(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }))
          );
        }
      );

    return () => {
      unsubscribeStudents();
      unsubscribeRequests();
    };

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
          'Student approved successfully'
        );

      } catch (err) {

        console.error(err);

        alert(
          'Approval failed'
        );
      }
    };
const handleDeleteStudent =
  async (student) => {

    const confirmDelete =
      window.confirm(
        `Delete ${student.fullName} and all history?`
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const requestsToDelete =
        requests.filter(
          (request) =>
            request.studentId ===
            student.id
        );

      for (const request of requestsToDelete) {

        await deleteDoc(
          doc(
            db,
            'bookRequests',
            request.id
          )
        );

      }

      await deleteDoc(
        doc(
          db,
          'users',
          student.id
        )
      );

      alert(
        'Student and history deleted successfully'
      );

    } catch (error) {

      console.error(error);

      alert(
        'Failed to delete student'
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

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status ===
          'Pending' &&
        (
          request.studentName
            ?.toLowerCase()
            .includes(
              requestSearch.toLowerCase()
            ) ||

          request.mobileNumber
            ?.includes(
              requestSearch
            ) ||

          request.bookName
            ?.toLowerCase()
            .includes(
              requestSearch.toLowerCase()
            )
        )
    );
const handleApproveRequest = async (
  request,
  days
) => {
  try {
    const bookRef = doc(
      db,
      'books',
      request.bookId
    );

    const bookSnap =
      await getDoc(bookRef);

    if (!bookSnap.exists()) {
      return alert(
        'Book not found'
      );
    }

    const bookData =
      bookSnap.data();

    if (
      (bookData.quantity ?? 0) <= 0
    ) {
      return alert(
        'No stock available'
      );
    }

    const issueDate =
      new Date();

    const dueDate =
      new Date();

    dueDate.setDate(
      issueDate.getDate() +
        Number(days || 15)
    );

    await updateDoc(
      doc(
        db,
        'bookRequests',
        request.id
      ),
      {
        status: 'Issued',
        issueDate,
        dueDate,
        renewalCount: 0
      }
    );

    await updateDoc(
      bookRef,
      {
        quantity:
          increment(-1)
      }
    );

    alert(
      `Book issued for ${
        days || 15
      } days`
    );

  } catch (err) {
    console.error(err);
    alert(
      'Issue failed'
    );
  }
};
  const issuedBooks =
  requests.filter(
    (request) =>
      request.status ===
        'Issued' &&
      (
        request.studentName
          ?.toLowerCase()
          .includes(
            issuedSearch.toLowerCase()
          ) ||

        request.mobileNumber
          ?.includes(
            issuedSearch
          ) ||

        request.bookName
          ?.toLowerCase()
          .includes(
            issuedSearch.toLowerCase()
          )
      )
  );
  const overdueBooks =
  requests.filter(
    (request) => {

      if (
        request.status !==
        'Issued'
      ) {
        return false;
      }

      if (
        !request.dueDate
      ) {
        return false;
      }

      const dueDate =
        new Date(
          request.dueDate.seconds *
            1000
        );

      const today =
        new Date();

      const matchesSearch =
        request.studentName
          ?.toLowerCase()
          .includes(
            renewSearch.toLowerCase()
          ) ||

        request.mobileNumber
          ?.includes(
            renewSearch
          ) ||

        request.bookName
          ?.toLowerCase()
          .includes(
            renewSearch.toLowerCase()
          );

      return (
        dueDate < today &&
        matchesSearch
      );
    }
  );
  const returnedBooks =
  requests.filter(
    (request) =>
      request.status ===
        'Returned' &&
      (
        request.studentName
          ?.toLowerCase()
          .includes(
            returnedSearch.toLowerCase()
          ) ||

        request.mobileNumber
          ?.includes(
            returnedSearch
          ) ||

        request.bookName
          ?.toLowerCase()
          .includes(
            returnedSearch.toLowerCase()
          )
      )
  );
  const filteredStudents =
  students.filter(
    (student) =>
      student.fullName
        ?.toLowerCase()
        .includes(
          studentSearch.toLowerCase()
        ) ||

      student.initiatedName
        ?.toLowerCase()
        .includes(
          studentSearch.toLowerCase()
        ) ||

      student.mobile
        ?.includes(
          studentSearch
        )
  );
  const deleteStudents =
  students.filter(
    (student) =>
      student.fullName
        ?.toLowerCase()
        .includes(
          deleteStudentSearch.toLowerCase()
        ) ||

      student.initiatedName
        ?.toLowerCase()
        .includes(
          deleteStudentSearch.toLowerCase()
        ) ||

      student.mobile
        ?.includes(
          deleteStudentSearch
        )
  );
 return (
  <>
    <Navbar
      isAdmin={true}
      user={{
        email: 'bvrvlibrary@gmail.com'
      }}
    />

     <div className="container mt-4">

     <div
  className="card border-0 shadow-lg mb-4"
  style={{
    background:
      "linear-gradient(135deg,#6f4e37,#8b5e3c)",
    color: "white"
  }}
>
  <div className="card-body p-4">
    <h2 className="mb-2">
      Library Administration Panel 📚
    </h2>

    <p className="mb-0">
      Manage book requests, student approvals,
      renewals and circulation records.
    </p>
  </div>
</div>
<div className="row g-4 mb-4">

  <div className="col-lg-3 col-md-6">
    <div
      className="card border-0 shadow-lg text-white"
      style={{
        background:
          "linear-gradient(135deg,#2F80ED,#56CCF2)",
        borderRadius: "20px"
      }}
    >
      <div className="card-body">
        <h5>📚 Pending</h5>
        <h1 className="fw-bold">
          {
            requests.filter(
              r => r.status === "Pending"
            ).length
          }
        </h1>
      </div>
    </div>
  </div>

  <div className="col-lg-3 col-md-6">
    <div
      className="card border-0 shadow-lg text-white"
      style={{
        background:
          "linear-gradient(135deg,#11998E,#38EF7D)",
        borderRadius: "20px"
      }}
    >
      <div className="card-body">
        <h5>📖 Issued</h5>
        <h1 className="fw-bold">
          {
            requests.filter(
              r => r.status === "Issued"
            ).length
          }
        </h1>
      </div>
    </div>
  </div>

  <div className="col-lg-3 col-md-6">
    <div
      className="card border-0 shadow-lg text-white"
      style={{
        background:
          "linear-gradient(135deg,#F7971E,#FFD200)",
        borderRadius: "20px"
      }}
    >
      <div className="card-body">
        <h5>👨‍🎓 Students</h5>
        <h1 className="fw-bold">
          {students.length}
        </h1>
      </div>
    </div>
  </div>

  <div className="col-lg-3 col-md-6">
    <div
      className="card border-0 shadow-lg text-white"
      style={{
        background:
          "linear-gradient(135deg,#EB3349,#F45C43)",
        borderRadius: "20px"
      }}
    >
      <div className="card-body">
        <h5>✅ Returned</h5>
        <h1 className="fw-bold">
          {
            requests.filter(
              r => r.status === "Returned"
            ).length
          }
        </h1>
      </div>
    </div>
  </div>

</div>
      <div className="row">

        <div className="col-md-3">

          <div className="list-group">

            <button
              className={`list-group-item list-group-item-action fw-semibold ${
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
              Approve Book Request
            </button>

            <button
              className={`list-group-item list-group-item-action fw-semibold ${
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
             Approve New Student
            </button>
<button
  className={`list-group-item list-group-item-action fw-semibold ${
    activeTab === 'issuedbooks'
      ? 'active'
      : ''
  }`}
  onClick={() =>
    setActiveTab(
      'issuedbooks'
    )
  }
>
  Issued Books
</button>
    <button
  className={`list-group-item list-group-item-action fw-semibold ${
    activeTab === 'renewbooks'
      ? 'active'
      : ''
  }`}
  onClick={() =>
    setActiveTab(
      'renewbooks'
    )
  }
>
  Renew Books
</button>
    <button
  className={`list-group-item list-group-item-action fw-semibold ${
    activeTab === 'returnedbooks'
      ? 'active'
      : ''
  }`}
  onClick={() =>
    setActiveTab(
      'returnedbooks'
    )
  }
>
  Returned Books
</button>
    <button
  className={`list-group-item list-group-item-action fw-semibold ${
    activeTab === 'studentdetails'
      ? 'active'
      : ''
  }`}
  onClick={() =>
    setActiveTab(
      'studentdetails'
    )
  }
>
  Student Details
</button>
    <button
  className={`list-group-item list-group-item-action fw-semibold ${
    activeTab === 'deletestudent'
      ? 'active'
      : ''
  }`}
  onClick={() =>
    setActiveTab(
      'deletestudent'
    )
  }
>
  Delete Student
</button>
          </div>

        </div>

        <div className="col-md-9">

          {activeTab ===
            'approvalpending' && (
            <div>

              <div className="card p-3 mb-3">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Student Name, Mobile or Book"
                  value={requestSearch}
                  onChange={(e) =>
                    setRequestSearch(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="card p-3">

                <h4 className="mb-3">
                  Approval Pending
                </h4>

                <div className="table-responsive">

                  <table className="table table-bordered">

                    <thead>
  <tr
    style={{
      backgroundColor: "#6f4e37",
      color: "white"
    }}
  >
                        <th>Student</th>
                        <th>Mobile</th>
                        <th>Book</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>

                      {pendingRequests.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center"
                          >
                            No pending requests
                          </td>
                        </tr>
                      ) : (
                        pendingRequests.map(
                          (request) => (
                            <tr
                              key={
                                request.id
                              }
                            >
                              <td>
                                {
                                  request.studentName
                                }
                              </td>

                              <td>
                                {
                                  request.mobileNumber
                                }
                              </td>

                              <td>
                                {
                                  request.bookName
                                }
                              </td>

                              <td>

  <div className="d-flex gap-2">

    <input
      type="number"
      min="1"
      placeholder="Days"
      className="form-control form-control-sm"
      style={{
        width: '90px'
      }}
      value={
        issueDays[
          request.id
        ] || ''
      }
      onChange={(e) =>
        setIssueDays({
          ...issueDays,
          [request.id]:
            e.target.value
        })
      }
    />

    <button
      onClick={() =>
        handleApproveRequest(
          request,
          Number(
            issueDays[
              request.id
            ] || 15
          )
        )
      }
      className="btn btn-success btn-sm"
    >
      Issue
    </button>

  </div>

</td>

                            </tr>
                          )
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

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

                      {pendingStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center"
                          >
                            No pending students
                          </td>
                        </tr>
                      ) : (
                        pendingStudents.map(
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
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>
          )}
{activeTab ===
  'issuedbooks' && (
  <div>

    <div className="card p-3 mb-3">
<h5
  className="fw-bold mb-3"
  style={{ color: "#6f4e37" }}
>
  🔍 Search Library Records
</h5>
      <input
        type="text"
        className="form-control"
        placeholder="Search by Student Name, Mobile or Book"
        value={issuedSearch}
        onChange={(e) =>
          setIssuedSearch(
            e.target.value
          )
        }
      />

    </div>

    <div className="card p-3">

      <h4 className="mb-3">
        Issued Books
      </h4>

      <div className="table-responsive">

        <table className="table table-bordered">

          <thead>
            <tr>
              <th>
                Student
              </th>

              <th>
                Mobile
              </th>

              <th>
                Book
              </th>

              <th>
                Issue Date
              </th>

              <th>
                Due Date
              </th>

              <th>
                Renewals
              </th>
          <th>
  Action
</th>
            </tr>
          </thead>

          <tbody>

            {issuedBooks.map(
              (request) => (
                <tr
                  key={
                    request.id
                  }
                >
                  <td>
                    {
                      request.studentName
                    }
                  </td>

                  <td>
                    {
                      request.mobileNumber
                    }
                  </td>

                  <td>
                    {
                      request.bookName
                    }
                  </td>

                  <td>
                    {request.issueDate
                      ? new Date(
                          request.issueDate.seconds *
                            1000
                        ).toLocaleDateString()
                      : '-'}
                  </td>

                  <td>
                    {request.dueDate
                      ? new Date(
                          request.dueDate.seconds *
                            1000
                        ).toLocaleDateString()
                      : '-'}
                  </td>

                  <td>
                    {request.renewalCount ||
                      0}
                  </td>
                    <td>

  <button
    onClick={() =>
      handleReturnBook(
        request
      )
    }
    className="btn btn-success btn-sm"
  >
    Return Book
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
  {activeTab ===
  'renewbooks' && (
  <div>

    <div className="card p-3 mb-3">

      <input
        type="text"
        className="form-control"
        placeholder="Search by Student Name, Mobile or Book"
        value={renewSearch}
        onChange={(e) =>
          setRenewSearch(
            e.target.value
          )
        }
      />

    </div>

    <div className="card p-3">

      <h4 className="mb-3">
        Overdue Books
      </h4>

      <div className="table-responsive">

        <table className="table table-bordered">

          <thead>
            <tr>
              <th>Student</th>
              <th>Mobile</th>
              <th>Book</th>
              <th>Due Date</th>
              <th>Renewals</th>
            </tr>
          </thead>

          <tbody>

            {overdueBooks.map(
              (request) => (
                <tr
                  key={
                    request.id
                  }
                >
                  <td>
                    {
                      request.studentName
                    }
                  </td>

                  <td>
                    {
                      request.mobileNumber
                    }
                  </td>

                  <td>
                    {
                      request.bookName
                    }
                  </td>

                  <td>
                    <span className="text-danger fw-bold">
                      {new Date(
                        request.dueDate.seconds *
                          1000
                      ).toLocaleDateString()}
                    </span>
                  </td>

                  <td>
                    {request.renewalCount ||
                      0}
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
  {activeTab ===
  'returnedbooks' && (
  <div>

    <div className="card p-3 mb-3">

      <input
        type="text"
        className="form-control"
        placeholder="Search by Student Name, Mobile or Book"
        value={returnedSearch}
        onChange={(e) =>
          setReturnedSearch(
            e.target.value
          )
        }
      />

    </div>

    <div className="card p-3">

      <h4 className="mb-3">
        Returned Books
      </h4>

      <div className="table-responsive">

        <table className="table table-bordered">

          <thead>
            <tr>
              <th>Student</th>
              <th>Mobile</th>
              <th>Book</th>
              <th>Return Date</th>
            </tr>
          </thead>

          <tbody>

            {returnedBooks.map(
              (request) => (
                <tr
                  key={
                    request.id
                  }
                >
                  <td>
                    {
                      request.studentName
                    }
                  </td>

                  <td>
                    {
                      request.mobileNumber
                    }
                  </td>

                  <td>
                    {
                      request.bookName
                    }
                  </td>

                  <td>
                    {request.returnDate
                      ? new Date(
                          request.returnDate.seconds *
                            1000
                        ).toLocaleDateString()
                      : '-'}
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
  {activeTab ===
  'studentdetails' && (
  <div>

    <div className="card p-3 mb-3">

      <input
        type="text"
        className="form-control"
        placeholder="Search by Student Name, Initiated Name or Mobile"
        value={studentSearch}
        onChange={(e) =>
          setStudentSearch(
            e.target.value
          )
        }
      />

    </div>

    <div
  className="card p-4 border-0 shadow-sm"
  style={{
    backgroundColor: '#f8f9fa'
  }}
>

      <h4 className="mb-3">
        Student Details
      </h4>

     <div className="row">

  {filteredStudents.map(
    (student) => {

      const issuedCount =
        requests.filter(
          (r) =>
            r.studentId ===
              student.id &&
            r.status ===
              'Issued'
        ).length;

      const returnedCount =
        requests.filter(
          (r) =>
            r.studentId ===
              student.id &&
            r.status ===
              'Returned'
        ).length;

      const activeCount =
        requests.filter(
          (r) =>
            r.studentId ===
              student.id &&
            r.status ===
              'Issued'
        ).length;

     return (
  <div
    key={student.id}
    className="col-lg-6 col-xl-4 mb-4"
  >
    <div
      className="card border-0 shadow h-100"
      style={{
        borderRadius: '18px',
        overflow: 'hidden'
      }}
    >

      <div
        style={{
          height: '6px',
          background:
            'linear-gradient(90deg, #0d6efd, #20c997)'
        }}
      />

      <div
        className="card-body"
        style={{
          background:
            'linear-gradient(135deg, #f8fbff, #eef5ff)'
        }}
      >

        <div className="text-center mb-3">

          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, #0d6efd, #20c997)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              margin: '0 auto'
            }}
          >
            {student.fullName
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <h5
            className="mt-3 mb-1 fw-bold"
            style={{
              color: '#0d6efd'
            }}
          >
            {student.fullName}
          </h5>

          <small className="text-muted">
            {student.initiatedName ||
              'No Initiated Name'}
          </small>

        </div>

        <hr />

        <div className="mb-2">
          <strong>📱 Mobile:</strong>
          <br />
          {student.mobile}
        </div>

        <div className="mb-2">
          <strong>📧 Email:</strong>
          <br />
          {student.email}
        </div>

        <div className="mb-2">
          <strong>🏛 Temple:</strong>
          <br />
          {student.temple}
        </div>

        <div className="mb-2">
          <strong>👤 Counselor:</strong>
          <br />
          {student.counselorName}
        </div>

        <div className="mb-3">
          <strong>☎ Counselor Mobile:</strong>
          <br />
          {student.counselorMobile}
        </div>

        <div className="mb-3">

          {student.approved ? (
            <span className="badge bg-success fs-6">
              Approved
            </span>
          ) : (
            <span className="badge bg-warning text-dark fs-6">
              Pending
            </span>
          )}

        </div>

        <div className="d-flex justify-content-between">

          <span className="badge bg-primary p-2">
            Issued: {issuedCount}
          </span>

          <span className="badge bg-success p-2">
            Returned: {returnedCount}
          </span>

          <span className="badge bg-danger p-2">
            Active: {activeCount}
          </span>

        </div>

      </div>

    </div>
  </div>
);    }
  )}
      </div>
    </div>
  </div>
)}
{activeTab === 'deletestudent' && (
  <div>

    <div
      className="card p-3 mb-3 border-0 shadow-sm"
      style={{
        background:
          'linear-gradient(135deg, #fff5f5, #ffeaea)'
      }}
    >
      <input
        type="text"
        className="form-control"
        placeholder="Search by Name, Initiated Name or Mobile"
        value={deleteStudentSearch}
        onChange={(e) =>
          setDeleteStudentSearch(
            e.target.value
          )
        }
      />
    </div>

    <div
      className="card p-4 border-0 shadow-sm"
      style={{
        backgroundColor: '#fff8f8'
      }}
    >
      <h4 className="mb-4 fw-bold text-danger">
        Delete Student
      </h4>

      <div className="row">

        {deleteStudents.map(
          (student) => {

            const issuedCount =
              requests.filter(
                (r) =>
                  r.studentId === student.id &&
                  r.status === 'Issued'
              ).length;

            const returnedCount =
              requests.filter(
                (r) =>
                  r.studentId === student.id &&
                  r.status === 'Returned'
              ).length;

            return (
              <div
                key={student.id}
                className="col-lg-6 col-xl-4 mb-4"
              >
                <div
                  className="card border-0 shadow h-100"
                  style={{
                    borderRadius: '18px'
                  }}
                >

                  <div
                    style={{
                      height: '6px',
                      background:
                        'linear-gradient(90deg,#dc3545,#ff6b6b)'
                    }}
                  />

                  <div className="card-body">

                    <h5 className="fw-bold text-danger">
                      {student.fullName}
                    </h5>

                    <p>
                      {student.initiatedName || '-'}
                    </p>

                    <p>
                      📱 {student.mobile}
                    </p>

                    <p>
                      📧 {student.email}
                    </p>

                    <p>
                      🏛 {student.temple}
                    </p>

                    <div className="mb-3">

                      <span className="badge bg-primary me-2">
                        Issued: {issuedCount}
                      </span>

                      <span className="badge bg-success">
                        Returned: {returnedCount}
                      </span>

                    </div>

                    <button
                      onClick={() =>
                        handleDeleteStudent(student)
                      }
                      className="btn btn-danger w-100"
                    >
                      Delete Student
                    </button>

                  </div>

                </div>
              </div>
            );
          }
        )}

      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  </>
  );
}
