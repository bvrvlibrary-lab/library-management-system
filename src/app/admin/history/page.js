'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import {
  collection,
  onSnapshot,
  updateDoc,
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
<button
  className={`list-group-item list-group-item-action ${
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
  className={`list-group-item list-group-item-action ${
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
  className={`list-group-item list-group-item-action ${
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
  className={`list-group-item list-group-item-action ${
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
                      <tr>
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

    <div className="card p-3">

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
          className="col-md-6 mb-3"
        >
          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <h5 className="card-title fw-bold">
                {student.fullName}
              </h5>

              <hr />

              <p>
                <strong>
                  Initiated Name:
                </strong>{' '}
                {student.initiatedName || '-'}
              </p>

              <p>
                <strong>
                  Mobile:
                </strong>{' '}
                {student.mobile}
              </p>

              <p>
                <strong>
                  Email:
                </strong>{' '}
                {student.email}
              </p>

              <p>
                <strong>
                  Temple:
                </strong>{' '}
                {student.temple}
              </p>

              <p>
                <strong>
                  Counselor Name:
                </strong>{' '}
                {student.counselorName}
              </p>

              <p>
                <strong>
                  Counselor Mobile:
                </strong>{' '}
                {student.counselorMobile}
              </p>

              <div className="mb-3">

                {student.approved ? (
                  <span className="badge bg-success">
                    Approved
                  </span>
                ) : (
                  <span className="badge bg-warning text-dark">
                    Pending
                  </span>
                )}

              </div>

              <div className="d-flex gap-2 flex-wrap">

                <span className="badge bg-primary">
                  Issued: {issuedCount}
                </span>

                <span className="badge bg-success">
                  Returned: {returnedCount}
                </span>

                <span className="badge bg-danger">
                  Active: {activeCount}
                </span>

              </div>

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
  );
}
