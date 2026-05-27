'use client';
import { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import {
  sendStudentEmail
} from '../../../lib/sendEmail';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  increment
} from 'firebase/firestore';

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
const [requests, setRequests] = useState([]);
const [issueDays, setIssueDays] = useState({});
  
  // Data input states for adding a new book
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('');
  const [position, setPosition] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    const unsubStudents = onSnapshot(
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

const unsubRequests = onSnapshot(
  collection(db, 'bookRequests'),
  (snapshot) => {
    setRequests(
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    );
  }
);
    const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
   return () => {
  unsubscribe();
  unsubStudents();
  unsubRequests();
};
  }, []);

  // BUTTON OPERATION 1: ADD BOOK
  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!name || !author) return alert('Book Name and Author are required.');

    await addDoc(collection(db, 'books'), {
      name,
      author,
      language,
      position,
      quantity: Number(quantity)
    });

    // Clear form inputs after adding
    setName(''); setAuthor(''); setLanguage(''); setPosition(''); setQuantity(1);
  };

  // BUTTON OPERATION 2: DELETE BOOK
  const handleDeleteBook = async (id) => {
    if (confirm('Are you sure you want to completely delete this book from inventory?')) {
      await deleteDoc(doc(db, 'books', id));
    }
  };
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
      `,
    });

    alert('Student approved');
  } catch (err) {
    console.error(err);
    alert('Approval failed');
  }
};
  const handleBulkUpload = async () => {
  if (!csvFile) {
    return alert('Please select a CSV file');
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    const text = e.target.result;

    const rows = text
      .split('\n')
      .filter(row => row.trim());

    let successCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(',');

      if (cols.length < 5) continue;

      await addDoc(collection(db, 'books'), {
        name: cols[0]?.trim(),
        author: cols[1]?.trim(),
        language: cols[2]?.trim(),
        position: cols[3]?.trim(),
        quantity: Number(cols[4]?.trim())
      });

      successCount++;
    }

    alert(`${successCount} books uploaded successfully`);
  };

  reader.readAsText(csvFile);
};
  return (
    <div>
      <h2 className="text-danger mb-4">Admin Book Control</h2>
      
      {/* ADD NEW ITEM FORM */}
      <div className="card p-4 mb-4 shadow-sm border-primary">
        <h4 className="mb-3 text-primary">Add a New Book</h4>
        <form onSubmit={handleAddBook} className="row g-3">
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Book Name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} required />
          </div>
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Language" value={language} onChange={e => setLanguage(e.target.value)} />
          </div>
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Shelf/Rack Location Coordinates" value={position} onChange={e => setPosition(e.target.value)} />
          </div>
          <div className="col-md-4">
            <input type="number" className="form-control" placeholder="Quantity/Stock" value={quantity} onChange={e => setQuantity(e.target.value)} min="0" />
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-success w-100">Add Book Button</button>
          </div>
        </form>
      </div>
<div className="card p-4 mb-4 shadow-sm border-success">
  <h4 className="mb-3 text-success">
    Bulk CSV Upload
  </h4>

  <input
    type="file"
    accept=".csv"
    className="form-control mb-3"
    onChange={(e) =>
      setCsvFile(e.target.files[0])
    }
  />

  <button
    onClick={handleBulkUpload}
    className="btn btn-success"
  >
    Upload CSV
  </button>
</div>
      {/* REPOSITORY BOOKS LIST TABLE */}
      <div className="card p-4 shadow-sm">
        <h4 className="mb-3">Current Library Stock Ledger</h4>
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Location</th>
              <th>Stock Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td><strong>{book.name}</strong></td>
                <td>{book.author}</td>
                <td>{book.position || 'Not Assigned'}</td>
                <td>{book.quantity} copies</td>
                <td>
                  {/* THE DELETE ACTION BUTTON */}
                  <button 
                    onClick={() => handleDeleteBook(book.id)} 
                    className="btn btn-sm btn-danger"
                  >
                    Delete Book
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
<div className="card p-4 mt-4 shadow-sm">
  <h4 className="mb-3 text-warning">
    Pending Student Approvals
  </h4>

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
    .filter(student => !student.approved)
    .map(student => (
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
</div>
  );
}
