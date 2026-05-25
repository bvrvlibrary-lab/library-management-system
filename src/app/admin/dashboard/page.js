'use client';
import { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  
  // Data input states for adding a new book
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('');
  const [position, setPosition] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
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
    </div>
  );
}
