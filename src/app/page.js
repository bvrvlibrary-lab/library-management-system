'use client';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  getDoc,
  increment,
  addDoc
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
const [searchTerm, setSearchTerm] = useState('');
const [languageFilter, setLanguageFilter] = useState('');
  const [libraryStats, setLibraryStats] = useState({
  books: 0,
  students: 0,
  languages: 0,
  copies: 0
});


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
const loadLibraryStats = async () => {
  try {
    const booksSnap = await getDocs(
      collection(db, 'books')
    );

    const studentsSnap = await getDocs(
      collection(db, 'users')
    );

    let copies = 0;
    const languages = new Set();

    booksSnap.forEach((doc) => {
      const book = doc.data();

      copies += Number(book.quantity || 0);

      if (book.language) {
        languages.add(
          book.language.trim().toLowerCase()
        );
      }
    });

    setLibraryStats({
      books: booksSnap.size,
      students: studentsSnap.size,
      languages: languages.size,
      copies
    });
  } catch (error) {
    console.error(error);
  }
};

loadLibraryStats();
    return () => {
      unsubBooks();
      unsubRequests();
      unsubAuth();
    };
  }, []);


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
const filteredBooks = books.filter((book) => {
  const matchesSearch =
    book.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    book.author
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

  const matchesLanguage =
    languageFilter === '' ||
    book.language
      ?.trim()
      .toLowerCase() ===
      languageFilter
        .trim()
        .toLowerCase();

  return matchesSearch && matchesLanguage;
});
  return (
  <>
    <Navbar
      isAdmin={isAdmin}
      user={user}
    />
 
    <div className="container mt-4">
        
     <div
  className="card border-0 shadow-lg mb-4"
  style={{
    background:
      'linear-gradient(135deg,#6f4e37,#8b5e3c)',
    color: 'white'
  }}
>
  <div className="card-body p-4">
    <h2 className="mb-2">
      Hare Krishna! {user?.email ? '👋' : ''}
    </h2>

    <p className="mb-0">
      Explore and request books from the
      BVRV Library Management System.
    </p>
  </div>
</div>

      <div className="row g-3 mb-4">

  <div className="col-md-3">
    <div className="card stat-card shadow-sm border-0">
      <div className="card-body text-center">
        <h2>📚</h2>
        <h4>{libraryStats.books}</h4>
        <small>Total Books</small>
      </div>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card stat-card shadow-sm border-0">
      <div className="card-body text-center">
        <h2>👨‍🎓</h2>
        <h4>{libraryStats.students}</h4>
        <small>Students</small>
      </div>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card stat-card shadow-sm border-0">
      <div className="card-body text-center">
        <h2>🌍</h2>
        <h4>{libraryStats.languages}</h4>
        <small>Languages</small>
      </div>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card stat-card shadow-sm border-0">
      <div className="card-body text-center">
        <h2>📦</h2>
        <h4>{libraryStats.copies}</h4>
        <small>Book Copies</small>
      </div>
    </div>
  </div>

</div>
<div className="card shadow-sm border-0 p-3 mb-4">
    
  <div className="row">

    <div className="col-md-8 mb-2">
      <input
        type="text"
        placeholder="Search by Book Name or Author"
        className="form-control"
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
      />
    </div>

    <div className="col-md-4 mb-2">
      <select
        className="form-select"
        value={languageFilter}
        onChange={(e) =>
          setLanguageFilter(e.target.value)
        }
      >
        <option value="">
          All Languages
        </option>

        {[...new Set(
          books.map(
            (book) =>
              book.language
                ?.trim()
                .toLowerCase()
          )
        )].map((language) => (
          <option
            key={language}
            value={language}
          >
            {language.charAt(0).toUpperCase() +
              language.slice(1)}
          </option>
        ))}
      </select>
    </div>

  </div>
</div>
     
       {/* BOOK LIST */}
      <div className="card p-3 mb-4">
     <div className="d-flex justify-content-between align-items-center mb-3">
  <h4 className="fw-bold mb-0">
    Library Books
  </h4>

  <span className="badge bg-dark">
    {books.length} Books
  </span>
</div>

 <div className="table-responsive">
  <table className="table table-hover align-middle">
       
       <thead
  style={{
    backgroundColor: '#6f4e37',
    color: 'white'
  }}
>
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
         {filteredBooks.map((book) => (
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
</div>

      {/* ADMIN REQUESTS */}
      {isAdmin && (
        <div className="card p-3 mb-4">
          <h4>Book Requests</h4>

 <div className="table-responsive">
  <table className="table table-hover align-middle">
     
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
    <span className="badge bg-danger">
      OVERDUE
    </span>
  ) : req.status === 'Pending' ? (
    <span className="badge bg-warning text-dark">
      Pending
    </span>
  ) : req.status === 'Issued' ? (
    <span className="badge bg-success">
      Issued
    </span>
  ) : (
    <span className="badge bg-secondary">
      Returned
    </span>
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
</div>
      )}

         </div>
</>
  );
}
