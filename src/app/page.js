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
  writeBatch,
  updateDoc
} from 'firebase/firestore';

export default function LibraryDashboard() {
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();

  // Admin Form States
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('');
  const [position, setPosition] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Load books + check login
  useEffect(() => {
    const unsubscribeBooks = onSnapshot(
      collection(db, 'books'),
      (snapshot) => {
        setBooks(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );
    const unsubscribeRequests = onSnapshot(
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

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);

        // ADMIN EMAIL
       const adminEmail = 'bvrvlibrary@gmail.com';

if (
  currentUser?.email?.toLowerCase() ===
  adminEmail.toLowerCase()
) {
  setIsAdmin(true);
} else {
  setIsAdmin(false);
}
      }
    );

    return () => {
  unsubscribeBooks();
  unsubscribeRequests();
  unsubscribeAuth();
};
  }, []);

  // Add Book
  const handleAddBook = async (e) => {
    e.preventDefault();

    if (!name || !author) {
      return alert(
        'Book Name and Author are required.'
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
  };

  // Delete Book (Admin Only)
  const handleDeleteBook = async (id) => {
    if (
      confirm(
        'Are you sure you want to delete this book?'
      )
    ) {
      await deleteDoc(doc(db, 'books', id));
    }
  };

  // Student Request Book
 const handleRequestBook = async (book) => {
  if (!user) {
    router.push('/login');
    return;
  }

  try {
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
  } catch (error) {
    console.error(error);
    alert('Failed to request book');
  }
};
  const handleApproveRequest = async (requestId) => {
  try {
    await updateDoc(
      doc(db, 'bookRequests', requestId),
      {
        status: 'Approved'
      }
    );

    alert('Book request approved');
  } catch (error) {
    console.error(error);
    alert('Approval failed');
  }
};

  // Bulk Upload CSV
  const handleBulkUpload = async (e) => {
    e.preventDefault();

    if (!bulkFile) {
      return alert(
        'Please choose a CSV file first.'
      );
    }

    setUploadStatus(
      'Reading CSV file...'
    );

    const reader = new FileReader();

    reader.onload = async (
      event
    ) => {
      try {
        const text =
          event.target.result;

        const rows =
          text.split(/\r?\n/);

        const headers =
          rows[0]
            .split(',')
            .map((h) =>
              h
                .trim()
                .toLowerCase()
            );

        const nameIdx =
          headers.indexOf(
            'name'
          );

        const authorIdx =
          headers.indexOf(
            'author'
          );

        const langIdx =
          headers.indexOf(
            'language'
          );

        const posIdx =
          headers.indexOf(
            'position'
          );

        const qtyIdx =
          headers.indexOf(
            'quantity'
          );

        if (
          nameIdx === -1 ||
          authorIdx === -1
        ) {
          throw new Error(
            'CSV must contain name and author columns.'
          );
        }

        const batch =
          writeBatch(db);

        let count = 0;

        for (
          let i = 1;
          i < rows.length;
          i++
        ) {
          if (
            !rows[i].trim()
          )
            continue;

          const columns =
            rows[i].split(
              ','
            );

          const bookName =
            columns[
              nameIdx
            ]?.trim();

          const bookAuthor =
            columns[
              authorIdx
            ]?.trim();

          const bookLang =
            langIdx !== -1
              ? columns[
                  langIdx
                ]?.trim()
              : 'English';

          const bookPos =
            posIdx !== -1
              ? columns[
                  posIdx
                ]?.trim()
              : 'Unassigned';

          const bookQty =
            qtyIdx !== -1
              ? Number(
                  columns[
                    qtyIdx
                  ]
                )
              : 1;

          if (
            bookName &&
            bookAuthor
          ) {
            const newBookRef =
              doc(
                collection(
                  db,
                  'books'
                )
              );

            batch.set(
              newBookRef,
              {
                name:
                  bookName,
                author:
                  bookAuthor,
                language:
                  bookLang,
                position:
                  bookPos,
                quantity:
                  isNaN(
                    bookQty
                  )
                    ? 1
                    : bookQty
              }
            );

            count++;
          }
        }

        await batch.commit();

        setUploadStatus(
          `Successfully uploaded ${count} books`
        );

        setBulkFile(null);
        e.target.reset();
      } catch (err) {
        alert(
          `Upload Failed: ${err.message}`
        );

        setUploadStatus(
          'Upload failed.'
        );
      }
    };

    reader.readAsText(
      bulkFile
    );
  };

  return (
    <div>
      <h2 className="text-danger mb-4">
        Library Management System
      </h2>
<p>
  Logged in as: {user?.email || 'No user'}
</p>

<p>
  Admin Status: {isAdmin ? 'YES' : 'NO'}
</p>
      {/* ADMIN ONLY */}
      {isAdmin && (
        <div className="row">
          {/* Add Book */}
          <div className="col-md-7">
            <div className="card p-4 mb-4 shadow-sm border-primary">
              <h4 className="mb-3 text-primary">
                Add a Single Book
              </h4>

              <form
                onSubmit={
                  handleAddBook
                }
                className="row g-3"
              >
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Book Name"
                    value={name}
                    onChange={(
                      e
                    ) =>
                      setName(
                        e.target
                          .value
                      )
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Author"
                    value={
                      author
                    }
                    onChange={(
                      e
                    ) =>
                      setAuthor(
                        e.target
                          .value
                      )
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Language"
                    value={
                      language
                    }
                    onChange={(
                      e
                    ) =>
                      setLanguage(
                        e.target
                          .value
                      )
                    }
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Shelf Location"
                    value={
                      position
                    }
                    onChange={(
                      e
                    ) =>
                      setPosition(
                        e.target
                          .value
                      )
                    }
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Quantity"
                    value={
                      quantity
                    }
                    onChange={(
                      e
                    ) =>
                      setQuantity(
                        e.target
                          .value
                      )
                    }
                  />
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                  >
                    Add Book
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Bulk Upload */}
          <div className="col-md-5">
            <div className="card p-4 mb-4 shadow-sm border-warning">
              <h4>
                Bulk Upload
              </h4>

              <form
                onSubmit={
                  handleBulkUpload
                }
              >
                <input
                  type="file"
                  accept=".csv"
                  className="form-control mb-3"
                  onChange={(
                    e
                  ) =>
                    setBulkFile(
                      e.target
                        .files[0]
                    )
                  }
                />

                <button className="btn btn-warning w-100">
                  Upload CSV
                </button>
              </form>

              {uploadStatus && (
                <div className="alert alert-info mt-3">
                  {
                    uploadStatus
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOOKS TABLE */}
      <div className="card p-4 shadow-sm">
        <h4 className="mb-3">
          Available Books (
          {books.length})
        </h4>

        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Location</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {books.map(
              (book) => (
                <tr
                  key={
                    book.id
                  }
                >
                  <td>
                    <strong>
                      {
                        book.name
                      }
                    </strong>
                  </td>

                  <td>
                    {
                      book.author
                    }
                  </td>

                  <td>
                    {book.position ||
                      'Not Assigned'}
                  </td>

                  <td>
                    {
                      book.quantity
                    }
                  </td>

                  <td>
                    {isAdmin ? (
                      <button
                        onClick={() =>
                          handleDeleteBook(
                            book.id
                          )
                        }
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    ) : user ? (
                      <button
                        onClick={() =>
                          handleRequestBook(
                            book
                          )
                        }
                        className="btn btn-primary btn-sm"
                      >
                        Pick Book
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          router.push(
                            '/signin'
                          )
                        }
                        className="btn btn-secondary btn-sm"
                      >
                        Sign In to Pick
                      </button>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
       </table>
      </div>

      {/* ADMIN BOOK REQUESTS */}
      {isAdmin && (
        <div className="card p-4 shadow-sm mt-4">
          <h4 className="mb-3">
            Student Book Requests
          </h4>

          <table className="table table-striped">
            <thead>
              <tr>
                <th>Student</th>
                <th>Book</th>
                <th>Author</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    {request.studentEmail}
                  </td>

                  <td>
                    {request.bookName}
                  </td>

                  <td>
                    {request.author}
                  </td>

                  <td>
                    {request.status}
                  </td>

                  <td>
                    {request.status ===
                    'Pending' ? (
                      <button
                        onClick={() =>
                          handleApproveRequest(
                            request.id
                          )
                        }
                        className="btn btn-success btn-sm"
                      >
                        Approve
                      </button>
                    ) : (
                      <span>
                        Approved
                      </span>
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
