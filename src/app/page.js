'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

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

export default function LibraryDashboard() {
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [renewDays, setRenewDays] = useState({});
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();

  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('');
  const [position, setPosition] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [bulkFile, setBulkFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    const unsubBooks = onSnapshot(collection(db, 'books'), (snap) => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubRequests = onSnapshot(collection(db, 'bookRequests'), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      const adminEmail = 'bvrvlibrary@gmail.com';
      setIsAdmin(u?.email?.toLowerCase() === adminEmail.toLowerCase());

      if (u) {
        const q = query(
          collection(db, 'bookRequests'),
          where('studentId', '==', u.uid)
        );

        const snap = await getDocs(q);
        setMyBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setMyBooks([]);
      }
    });

    return () => {
      unsubBooks();
      unsubRequests();
      unsubAuth();
    };
  }, []);

  // ---------------- ADD BOOK ----------------
  const handleAddBook = async (e) => {
    e.preventDefault();

    if (!name || !author) {
      return alert('Book Name and Author required');
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
  };

  // ---------------- DELETE BOOK ----------------
  const handleDeleteBook = async (id) => {
    if (confirm('Delete book?')) {
      await deleteDoc(doc(db, 'books', id));
    }
  };

  // ---------------- REQUEST BOOK (STUDENT) ----------------
  const handleRequestBook = async (book) => {
    if (!user) return router.push('/login');

    if ((book.quantity ?? 0) <= 0) {
      return alert('No books available');
    }

    const existing = await getDocs(
      query(
        collection(db, 'bookRequests'),
        where('studentId', '==', user.uid),
        where('bookId', '==', book.id),
        where('status', '!=', 'Returned')
      )
    );

    if (!existing.empty) {
      alert('Already requested/issued this book');
      return;
    }

    await addDoc(collection(db, 'bookRequests'), {
      studentEmail: user.email,
      studentId: user.uid,
      bookId: book.id,
      bookName: book.name,
      author: book.author,
      status: 'Pending',
      requestDate: new Date()
    });

    alert(`Request sent for ${book.name}`);
  };

  // ---------------- APPROVE (ADMIN -> ISSUE BOOK) ----------------
  const handleApproveRequest = async (request) => {
    try {
      const bookRef = doc(db, 'books', request.bookId);
      const bookSnap = await getDoc(bookRef);

      if (!bookSnap.exists()) {
        return alert('Book not found');
      }

      const bookData = bookSnap.data();

      if ((bookData.quantity ?? 0) <= 0) {
        return alert('No stock available');
      }

      await updateDoc(doc(db, 'bookRequests', request.id), {
        status: 'Issued'
      });

      await updateDoc(bookRef, {
        quantity: increment(-1)
      });

      alert('Book issued successfully');
    } catch (err) {
      console.error(err);
      alert('Approval failed');
    }
  };

  // ---------------- RETURN BOOK ----------------
  const handleReturnBook = async (request) => {
    try {
      await updateDoc(doc(db, 'bookRequests', request.id), {
        status: 'Returned',
        returnDate: new Date()
      });

      await updateDoc(doc(db, 'books', request.bookId), {
        quantity: increment(1)
      });

      alert('Book returned');
    } catch (err) {
      console.error(err);
      alert('Return failed');
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="p-4">
      <h2>Library Management System</h2>

      {/* BOOK LIST */}
      <div className="card p-3 mt-3">
        <h4>Books ({books.length})</h4>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Author</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td>{book.name}</td>
                <td>{book.author}</td>
                <td>{book.quantity}</td>
                <td>
                  {isAdmin ? (
                    <button onClick={() => handleDeleteBook(book.id)}>
                      Delete
                    </button>
                  ) : (
                    <button onClick={() => handleRequestBook(book)}>
                      Request
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADMIN REQUEST PANEL */}
      {isAdmin && (
        <div className="card p-3 mt-4">
          <h4>Book Requests</h4>

          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Book</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td>{req.studentEmail}</td>
                  <td>{req.bookName}</td>
                  <td>{req.status}</td>
                  <td>
                    {req.status === 'Pending' ? (
                      <button
                        onClick={() => handleApproveRequest(req)}
                        className="btn btn-success btn-sm"
                      >
                        Issue
                      </button>
                    ) : req.status === 'Issued' ? (
                      <button
                        onClick={() => handleReturnBook(req)}
                        className="btn btn-warning btn-sm"
                      >
                        Return
                      </button>
                    ) : (
                      <span>Returned</span>
                    )}
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
