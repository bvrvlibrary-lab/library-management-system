'use client';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function PhysicalBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
const [students, setStudents] = useState([]);
  useEffect(() => {
    // This looks at your live database books collection
    const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      const bookData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(bookData);
    });
    return () => unsubscribe();
  }, []);

  // Filter book arrays instantly by checking match strings
  const filteredBooks = books.filter(book => 
    book.name?.toLowerCase().includes(search.toLowerCase()) ||
    book.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="mb-4">Physical Books Catalog</h2>
      <input 
        type="text" 
        className="form-control mb-4" 
        placeholder="Search by Book Name or Author..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="row">
        {filteredBooks.map(book => (
          <div key={book.id} className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{book.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">By {book.author}</h6>
                <p className="card-text mb-1"><strong>Language:</strong> {book.language}</p>
                <p className="card-text mb-1"><strong>Location:</strong> {book.position}</p>
                <p className="card-text">
                  <strong>Available Stock:</strong>{' '}
                  <span className={`badge ${book.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                    {book.quantity} units
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
