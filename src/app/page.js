'use client';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  
  // Form States for Single Book Mode
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('');
  const [position, setPosition] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Bulk Upload File State
  const [bulkFile, setBulkFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Operation 1: Add a Single Book
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

    setName(''); setAuthor(''); setLanguage(''); setPosition(''); setQuantity(1);
  };

  // Operation 2: Delete an Individual Material
  const handleDeleteBook = async (id) => {
    if (confirm('Are you sure you want to completely delete this book from inventory?')) {
      await deleteDoc(doc(db, 'books', id));
    }
  };

  // Operation 3: Handle Bulk Upload processing (.CSV files)
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return alert('Please choose a spreadsheet file first.');

    setUploadStatus('Reading spreadsheet parameters...');
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        // Break rows by looking at line endings
        const rows = text.split(/\r?\n/);
        
        // Extract headers from Row #1
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        
        // Match spreadsheet labels to our database schema mapping
        const nameIdx = headers.indexOf('name');
        const authorIdx = headers.indexOf('author');
        const langIdx = headers.indexOf('language');
        const posIdx = headers.indexOf('position');
        const qtyIdx = headers.indexOf('quantity');

        if (nameIdx === -1 || authorIdx === -1) {
          throw new Error('Your CSV columns must include "name" and "author" fields at least.');
        }

        setUploadStatus('Connecting to Firestore transaction channels...');
        const batch = writeBatch(db);
        let itemsAddedCount = 0;

        // Skip row 0 (header block) and cycle through raw book data arrays
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip blank layout spaces
          
          const columns = rows[i].split(',');
          
          const bookName = columns[nameIdx]?.trim();
          const bookAuthor = columns[authorIdx]?.trim();
          const bookLang = langIdx !== -1 ? columns[langIdx]?.trim() : 'English';
          const bookPos = posIdx !== -1 ? columns[posIdx]?.trim() : 'Unassigned';
          const bookQty = qtyIdx !== -1 ? Number(columns[qtyIdx]) : 1;

          if (bookName && bookAuthor) {
            const newBookRef = doc(collection(db, 'books'));
            batch.set(newBookRef, {
              name: bookName,
              author: bookAuthor,
              language: bookLang,
              position: bookPos,
              quantity: isNaN(bookQty) ? 1 : bookQty
            });
            itemsAddedCount++;
          }
        }

        if (itemsAddedCount === 0) {
          throw new Error('No valid database records found inside the document structure.');
        }

        // Send all books to the cloud database at once securely
        await batch.commit();
        setUploadStatus(`Success! Bulk registered ${itemsAddedCount} books to your catalog.`);
        setBulkFile(null);
        e.target.reset(); // Reset file upload interface element
      } catch (err) {
        alert(`Bulk Upload Failed: ${err.message}`);
        setUploadStatus('Upload operation aborted.');
      }
    };

    reader.readAsText(bulkFile);
  };

  return (
    <div>
      <h2 className="text-danger mb-4">Admin Inventory Control & Bulk System</h2>
      
      <div className="row">
        {/* VIEW 1: SINGLE DATA ENTRY FORM */}
        <div className="col-md-7">
          <div className="card p-4 mb-4 shadow-sm border-primary">
            <h4 className="mb-3 text-primary">Add a Single Book</h4>
            <form onSubmit={handleAddBook} className="row g-3">
              <div className="col-md-6">
                <input type="text" className="form-control" placeholder="Book Name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <input type="text" className="form-control" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} required />
              </div>
              <div className="col-md-4">
                <input type="text" className="form-control" placeholder="Language" value={language} onChange={e => setLanguage(e.target.value)} />
              </div>
              <div className="col-md-4">
                <input type="text" className="form-control" placeholder="Shelf Location" value={position} onChange={e => setPosition(e.target.value)} />
              </div>
              <div className="col-md-4">
                <input type="number" className="form-control" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} min="0" />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-success w-100">Add Book Button</button>
              </div>
            </form>
          </div>
        </div>

        {/* VIEW 2: FRESH BULK UPLOAD FACILITY GRID CONTAINER */}
        <div className="col-md-5">
          <div className="card p-4 mb-4 shadow-sm border-warning bg-white">
            <h4 className="mb-3 text-warning">Bulk Upload Spreadsheet Facility</h4>
            <p className="small text-muted mb-3">
              Upload a comma-separated <strong>.csv</strong> configuration list to insert bulk lines into the catalog[cite: 54].
            </p>
            <form onSubmit={handleBulkUpload}>
              <div className="mb-3">
                <input 
                  type="file" 
                  accept=".csv" 
                  className="form-control" 
                  onChange={e => setBulkFile(e.target.files[0])}
                  required 
                />
              </div>
              <button type="submit" className="btn btn-warning w-100 text-dark fw-bold">
                Run Bulk System Upload
              </button>
            </form>
            {uploadStatus && (
              <div className="alert alert-info mt-3 py-2 small text-center mb-0">
                {uploadStatus}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REPOSITORY BOOKS LIST TABLE */}
      <div className="card p-4 shadow-sm">
        <h4 className="mb-3">Current Library Stock Ledger ({books.length} Total Titles)</h4>
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
                  <button onClick={() => handleDeleteBook(book.id)} className="btn btn-sm btn-danger">
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
