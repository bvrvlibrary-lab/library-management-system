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
  updateDoc,
  query,
  where,
  getDocs,
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

  // Admin Form States
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('');
  const [position, setPosition] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    const unsubscribeBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      setBooks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubscribeRequests = onSnapshot(collection(db, 'bookRequests'), (snapshot) => {
      setRequests(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      const adminEmail = 'bvrvlibrary@gmail.com';

      setIsAdmin(currentUser?.email?.toLowerCase() === adminEmail.toLowerCase());

      if (currentUser) {
        const myBooksQuery = query(
          collection(db, 'bookRequests'),
          where('studentId', '==', currentUser.uid)
        );

        const snapshot = await getDocs(myBooksQuery);

        setMyBooks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else {
        setMyBooks([]);
      }
    });

    return () => {
      unsubscribeBooks();
      unsubscribeRequests();
      unsubscribeAuth();
    };
  }, []);

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

    setName('');
    setAuthor('');
    setLanguage('');
    setPosition('');
    setQuantity(1);
  };

  const handleDeleteBook = async (id) => {
    if (confirm('Are you sure you want to delete this book?')) {
      await deleteDoc(doc(db, 'books', id));
    }
  };

  const handleRequestBook = async (book) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const requestQuery = query(
        collection(db, 'bookRequests'),
        where('studentId', '==', user.uid),
        where('bookId', '==', book.id)
      );

      const existing = await getDocs(requestQuery);

      if (!existing.empty) {
        alert('You already requested this book.');
        return;
      }

      const currentQty = book.quantity ?? 0;

      if (currentQty <= 0) {
        alert(`There were ${currentQty} books. All are issued.`);
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

      await updateDoc(doc(db, 'books', book.id), {
        quantity: increment(-1)
      });

      alert(`Request sent for ${book.name}`);
    } catch (error) {
      console.error(error);
      alert('Failed to request book');
    }
  };

  const handleApproveRequest = async (requestId, days) => {
    try {
      const nextRenewalDate = new Date();
      nextRenewalDate.setDate(nextRenewalDate.getDate() + Number(days));

      await updateDoc(doc(db, 'bookRequests', requestId), {
        status: 'Approved',
        renewalDays: Number(days),
        nextRenewalDate
      });

      alert('Book request approved');
    } catch (error) {
      console.error(error);
      alert('Approval failed');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();

    if (!bulkFile) return alert('Please choose a CSV file first.');

    setUploadStatus('Reading CSV file...');

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split(/\r?\n/);
        const headers = rows[0].split(',').map((h) => h.trim().toLowerCase());

        const nameIdx = headers.indexOf('name');
        const authorIdx = headers.indexOf('author');
        const langIdx = headers.indexOf('language');
        const posIdx = headers.indexOf('position');
        const qtyIdx = headers.indexOf('quantity');

        const batch = writeBatch(db);
        let count = 0;

        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;

          const cols = rows[i].split(',');

          const bookName = cols[nameIdx]?.trim();
          const bookAuthor = cols[authorIdx]?.trim();
          const bookLang = langIdx !== -1 ? cols[langIdx]?.trim() : 'English';
          const bookPos = posIdx !== -1 ? cols[posIdx]?.trim() : 'Unassigned';
          const bookQty = qtyIdx !== -1 ? Number(cols[qtyIdx]) : 1;

          if (bookName && bookAuthor) {
            const ref = doc(collection(db, 'books'));
            batch.set(ref, {
              name: bookName,
              author: bookAuthor,
              language: bookLang,
              position: bookPos,
              quantity: isNaN(bookQty) ? 1 : bookQty
            });
            count++;
          }
        }

        await batch.commit();
        setUploadStatus(`Successfully uploaded ${count} books`);
        setBulkFile(null);
        e.target.reset();
      } catch (err) {
        console.error(err);
        setUploadStatus('Upload failed');
        alert(`Upload Failed: ${err.message}`);
      }
    };

    reader.readAsText(bulkFile);
  };

  return (
    <div>
      <h2 className="text-danger mb-4">Library Management System</h2>

      {isAdmin && (
        <div className="row" />
      )}
    </div>
  );
}
