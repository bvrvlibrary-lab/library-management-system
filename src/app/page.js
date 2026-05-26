'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  getDoc,
  increment
} from 'firebase/firestore';
import {
  sendAdminEmail,
  sendStudentEmail,
} from "../lib/sendEmail";

export default function LibraryDashboard() {
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('');
  const [position, setPosition] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [issueDays, setIssueDays] = useState({});

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    const unsubBooks = onSnapshot(collection(db, 'books'), (snap) => {
      setBooks(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
      );
    });
const unsubStudents = onSnapshot(
  collection(db, 'users'),
  (snap) => {
    setStudents(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }))
    );
  }
);  
    const unsubRequests = onSnapshot(
      collection(db, 'bookRequests'),
      (snap) => {
        setRequests(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data()
          }))
        );
      }
    );

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);

      const adminEmail = 'bvrvlibrary@gmail.com';

      setIsAdmin(
        u?.email?.toLowerCase() ===
          adminEmail.toLowerCase()
      );
    });

    return () => {
      unsubBooks();
      unsubRequests();
      unsubAuth();
      unsubStudents();
    };
  }, []);

  // ---------------- ADD BOOK ----------------
  const handleAddBook = async (e) => {
    e.preventDefault();

    try {
      if (!name || !author) {
        return alert(
          'Book name and author required'
        );
      }

      await addDoc(collection(db, 'books'), {
        name,
        author,
        language,
        position,
        quantity: Number(quantity)
      });

      setName('');
      setAuthor('');
      setLanguage('');
      setPosition('');
      setQuantity(1);

      alert('Book added successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to add book');
    }
  };

  // ---------------- DELETE BOOK ----------------
  const handleDeleteBook = async (id) => {
    try {
      const confirmDelete = confirm(
        'Delete this book?'
      );

      if (!confirmDelete) return;

      await deleteDoc(doc(db, 'books', id));

      alert('Book deleted');
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  // ---------------- REQUEST BOOK ----------------
  const handleRequestBook = async (book) => {
    try {
      if (!user) {
    const userQuery = query(
  collection(db, 'users'),
  where('email', '==', user.email)
);

const userSnap = await getDocs(userQuery);

let studentName = '';
let mobileNumber = '';

if (!userSnap.empty) {
  const userData = userSnap.docs[0].data();

  studentName = userData.name || '';
  mobileNumber = userData.mobile || '';
}
        return alert('Please login first');
      }

      if ((book.quantity ?? 0) <= 0) {
        return alert('Book out of stock');
      }
const userRef = doc(db, 'users', user.uid);

const userSnap = await getDoc(userRef);

let studentName = '';
let mobileNumber = '';

if (userSnap.exists()) {
  const userData = userSnap.data();

  studentName = userData.fullName || '';
  mobileNumber = userData.mobile || '';
}
      const q = query(
        collection(db, 'bookRequests'),
        where('studentId', '==', user.uid),
        where('bookId', '==', book.id)
      );

      const snap = await getDocs(q);

      const alreadyExists = snap.docs.some((d) => {
        const data = d.data();

        return (
          data.status === 'Pending' ||
          data.status === 'Issued'
        );
      });

      if (alreadyExists) {
        return alert(
          'You already requested this book'
        );
      }

      await addDoc(collection(db, 'bookRequests'), {
        studentEmail: user.email,
        studentId: user.uid,
        studentName,
mobileNumber,
        bookId: book.id,
        bookName: book.name,  
        author: book.author,
        status: 'Pending',
        requestDate: new Date()
        
      });
await sendAdminEmail({
  to_email: 'bvrvlibrary@gmail.com',
  subject: 'New Book Request',
message: `
A new book request was submitted.

Book: ${book.name}

Student Name: ${studentName}

Mobile Number: ${mobileNumber}

Student Email: ${user.email}
`,
});
      alert('Book request submitted');
    } catch (err) {
      console.error(err);
      alert('Request failed');
    }
  };

  // ---------------- APPROVE REQUEST ----------------
  const handleApproveRequest = async (
    request,
    days
  ) => {
    try {
      if (request.status !== 'Pending') {
        return alert('Already processed');
      }

      const bookRef = doc(
        db,
        'books',
        request.bookId
      );

      const bookSnap = await getDoc(bookRef);

      if (!bookSnap.exists()) {
        return alert('Book not found');
      }

      const bookData = bookSnap.data();

      if ((bookData.quantity ?? 0) <= 0) {
        return alert('No stock available');
      }

      const issueDate = new Date();

      const dueDate = new Date();

      dueDate.setDate(
        issueDate.getDate() + days
      );

      await updateDoc(
        doc(db, 'bookRequests', request.id),
        {
          status: 'Issued',
          issueDate,
          dueDate,
          renewalCount: 0
        }
      );

      await updateDoc(bookRef, {
        quantity: increment(-1)
      });
await sendStudentEmail({
  to_email: request.studentEmail,
  subject: 'Book Issued Successfully',
  message: `
Your requested book has been issued.

Book: ${request.bookName}

Issue Days: ${days}

Due Date:
${dueDate.toLocaleDateString()}
  `,
});
      alert(`Book issued for ${days} days`);
    } catch (err) {
      console.error(err);
      alert('Issue failed');
    }
  };

  // ---------------- RETURN BOOK ----------------
  const handleReturnBook = async (
    request
  ) => {
    try {
      if (request.status !== 'Issued') {
        return alert(
          'Book already returned'
        );
      }

      await updateDoc(
        doc(db, 'bookRequests', request.id),
        {
          status: 'Returned',
          returnDate: new Date()
        }
      );

      await updateDoc(
        doc(db, 'books', request.bookId),
        {
          quantity: increment(1)
        }
      );
await sendStudentEmail({
  to_email: request.studentEmail,
  subject: 'Book Returned',
  message: `
Your returned book has been received.

Book: ${request.bookName}

Thank you for using the library.
  `,
});
      alert('Book returned successfully');
    } catch (err) {
      console.error(err);
      alert('Return failed');
    }
  };

  // ---------------- RENEW BOOK ----------------
  const handleRenewBook = async (
    request
  ) => {
    try {
      if (request.status !== 'Issued') {
        return alert('Cannot renew');
      }
const handleApproveStudent = async (
  student
) => {
  try {
    await updateDoc(
      doc(db, 'users', student.id),
      {
        approved: true
      }
    );

    await sendStudentEmail({
      to_email: student.email,
      subject: 'Library Account Approved',
      message: `
Your library account has been approved.

You can now login and request books.

Welcome to the library system.
      `,
    });

    alert('Student approved successfully');
  } catch (err) {
    console.error(err);
    alert('Approval failed');
  }
};
      const currentDueDate = new Date(
        request.dueDate.seconds * 1000
      );

      currentDueDate.setDate(
        currentDueDate.getDate() + 7
      );

      await updateDoc(
        doc(db, 'bookRequests', request.id),
        {
          dueDate: currentDueDate,
          renewalCount:
            (request.renewalCount || 0) + 1
        }
      );
await sendStudentEmail({
  to_email: request.studentEmail,
  subject: 'Book Renewed',
  message: `
Your book renewal was approved.

Book: ${request.bookName}

New Due Date:
${currentDueDate.toLocaleDateString()}
  `,
});
      alert('Book renewed for 15 more days');
    } catch (err) {
      console.error(err);
      alert('Renew failed');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        Library Management System
      </h2>

      {/* ADMIN ADD BOOK */}
      {isAdmin && (
        <div className="card p-3 mb-4">
          <h4>Add Book</h4>

          <form onSubmit={handleAddBook}>
            <div className="row">
              <div className="col-md-3 mb-2">
                <input
                  type="text"
                  placeholder="Book Name"
                  className="form-control"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              </div>

              <div className="col-md-3 mb-2">
                <input
                  type="text"
                  placeholder="Author"
                  className="form-control"
                  value={author}
                  onChange={(e) =>
                    setAuthor(e.target.value)
                  }
                />
              </div>

              <div className="col-md-2 mb-2">
                <input
                  type="text"
                  placeholder="Language"
                  className="form-control"
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value)
                  }
                />
              </div>

              <div className="col-md-2 mb-2">
                <input
                  type="text"
                  placeholder="Position"
                  className="form-control"
                  value={position}
                  onChange={(e) =>
                    setPosition(e.target.value)
                  }
                />
              </div>

              <div className="col-md-1 mb-2">
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                />
              </div>

              <div className="col-md-1 mb-2">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

  <div className="card p-3 mb-4">
  <h4>Pending Student Approvals</h4>

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
      {students
        .filter((s) => !s.approved)
        .map((student) => (
          <tr key={student.id}>
            <td>{student.fullName}</td>
            <td>{student.email}</td>
            <td>{student.mobile}</td>
            <td>{student.temple}</td>

            <td>
              <button
                onClick={() =>
                  handleApproveStudent(student)
                }
                className="btn btn-success btn-sm"
              >
                Approve
              </button>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
</div>
      {/* BOOK LIST */}
      <div className="card p-3 mb-4">
        <h4>Books ({books.length})</h4>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Author</th>
              <th>Language</th>
              <th>Position</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.name}</td>
                <td>{book.author}</td>
                <td>{book.language}</td>
                <td>{book.position}</td>
                <td>{book.quantity}</td>

                <td>
                  {isAdmin ? (
                    <button
                      onClick={() =>
                        handleDeleteBook(book.id)
                      }
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleRequestBook(book)
                      }
                      className="btn btn-primary btn-sm"
                      disabled={
                        book.quantity <= 0
                      }
                    >
                      {book.quantity <= 0
                        ? 'Out of Stock'
                        : 'Request'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADMIN REQUESTS */}
      {isAdmin && (
        <div className="card p-3 mb-4">
          <h4>Book Requests</h4>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Student</th>
                <th>Book</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.studentEmail}</td>
                  <td>{req.bookName}</td>
                <td>
  {req.status === 'Issued' &&
  req.dueDate &&
  new Date() >
    new Date(
      req.dueDate.seconds * 1000
    ) ? (
    <span className="text-danger fw-bold">
      OVERDUE
    </span>
  ) : (
    req.status
  )}
</td>

                  <td>
                    {req.dueDate
                      ? new Date(
                          req.dueDate.seconds *
                            1000
                        ).toLocaleDateString()
                      : '-'}
                  </td>

                  <td>
                    {req.status ===
                    'Pending' ? (
                      <div className="d-flex gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Days"
                          className="form-control form-control-sm"
                          style={{
                            width: '80px'
                          }}
                          value={
                            issueDays[req.id] ||
                            ''
                          }
                          onChange={(e) =>
                            setIssueDays({
                              ...issueDays,
                              [req.id]:
                                e.target.value
                            })
                          }
                        />

                        <button
                          onClick={() =>
                            handleApproveRequest(
                              req,
                              Number(
                                issueDays[
                                  req.id
                                ] || 15
                              )
                            )
                          }
                          className="btn btn-success btn-sm"
                        >
                          Issue
                        </button>
                      </div>
                     ) : req.status === 'Issued' ? (
  <div className="d-flex gap-2">
    <button
      onClick={() =>
        handleRenewBook(req)
      }
      className="btn btn-primary btn-sm"
    >
      Renew
    </button>

    <button
      onClick={() =>
        handleReturnBook(req)
      }
      className="btn btn-warning btn-sm"
    >
      Return
    </button>
  </div>
): (
                      <span className="text-success">
                        Returned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* STUDENT MY BOOKS */}
      {!isAdmin && user && (
        <div className="card p-3">
          <h4>My Books</h4>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Book</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Renew Count</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests
                .filter(
                  (r) =>
                    r.studentId === user.uid
                )
                .map((req) => (
                  <tr key={req.id}>
                    <td>{req.bookName}</td>
<td>
  {req.status === 'Issued' &&
  req.dueDate &&
  new Date() >
    new Date(
      req.dueDate.seconds * 1000
    ) ? (
    <span className="text-danger fw-bold">
      OVERDUE
    </span>
  ) : (
    req.status
  )}
</td>

                    <td>
                      {req.dueDate
                        ? new Date(
                            req.dueDate
                              .seconds * 1000
                          ).toLocaleDateString()
                        : '-'}
                    </td>

                    <td>
                      {req.renewalCount || 0}
                    </td>

                   <td>
  {req.status}
</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
