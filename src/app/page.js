'use client';
import BottomNavbar from "../components/BottomNavbar";
import MobileHeader from "../components/MobileHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import CustomAlert from '../components/CustomAlert';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
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
  const [authLoading, setAuthLoading] = useState(true);
  const [customAlert, setCustomAlert] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
const [isMobile, setIsMobile] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [languageFilter, setLanguageFilter] = useState('');
const [inStockOnly, setInStockOnly] = useState(false);
  const [libraryStats, setLibraryStats] = useState({
  books: 0,
  students: 0,
  languages: 0,
  copies: 0
});


  const [issueDays, setIssueDays] = useState({});

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const unsubBooks = onSnapshot(
      collection(db, 'books'),
      (snap) => {
        setBooks(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data()
          }))
        );
      },
      (error) => {
        console.warn("Books load notice:", error.message);
      }
    );

    let unsubRequests = () => {};

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);

      const adminEmail = 'bvrvlibrary@gmail.com';
      setIsAdmin(
        u?.email?.toLowerCase() ===
          adminEmail.toLowerCase()
      );
      setAuthLoading(false);

      if (u) {
        unsubRequests();
        unsubRequests = onSnapshot(
          collection(db, 'bookRequests'),
          (snap) => {
            setRequests(
              snap.docs.map((d) => ({
                id: d.id,
                ...d.data()
              }))
            );
          },
          (error) => {
            console.warn("Book requests listener notice:", error.message);
          }
        );
      } else {
        setRequests([]);
      }
    });

    const loadLibraryStats = async () => {
      try {
        const booksSnap = await getDocs(
          collection(db, "books")
        );

        let studentsCount = 0;
        try {
          const studentsSnap = await getDocs(
            collection(db, "users")
          );
          studentsCount = studentsSnap.size;
        } catch (_) {
          // Non-admin users cannot read entire users collection
        }

        let copies = 0;
        const languages = new Set();

        booksSnap.forEach((bookDoc) => {
          const book = bookDoc.data();
          copies += Number(book.quantity || 0);
          if (book.language) {
            languages.add(
              book.language.trim().toLowerCase()
            );
          }
        });

        setLibraryStats({
          books: booksSnap.size,
          students: studentsCount,
          languages: languages.size,
          copies
        });
      } catch (error) {
        console.warn("Library statistics notice:", error.message);
      }
    };

    loadLibraryStats();

    return () => {
      unsubBooks();
      unsubRequests();
      unsubAuth();
      window.removeEventListener("resize", checkMobile);
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
      if (!userSnap.exists()) {
  await signOut(auth);

  setCustomAlert(
    'Your account is no longer active. Please contact the library administrator.'
  );

  return;
}

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
// Check how many pending requests already exist for this book
const pendingQuery = query(
  collection(db, 'bookRequests'),
  where('bookId', '==', book.id),
  where('status', '==', 'Pending')
);

const pendingSnap = await getDocs(pendingQuery);

if (pendingSnap.size >= (book.quantity ?? 0)) {
  return alert(
    'This book is already requested by another Devotee. Please wait until it becomes available.'
  );
}
      if (alreadyExists) {
  setCustomAlert(
    'You already requested this book.'
  );
  return;
}

      await addDoc(collection(db, 'bookRequests'), {
        studentEmail: user.email,
        studentId: user.uid,
        studentName,
mobileNumber,
        bookId: book.id,
        bookName: book.name,  
        author: book.author,
        language: book.language,
position: book.position,
        status: 'Pending',
        requestDate: new Date()
        
      });
await sendAdminEmail({
  to_email: 'bvrvlibrary@gmail.com',
  subject: '📚 New Book Request',
  message: `
A new book request was submitted.

📖 Book: ${book.name}
✍️ Author: ${book.author}
🌐 Language: ${book.language}
📍 Location: ${book.position}

👤 Student Details

Name: ${studentName}
Mobile: ${mobileNumber}
Email: ${user.email}
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
  subject: "Test Email",
  message: "This is a test email from the Library System."
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
const filteredBooks = books
  .filter((book) => {
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

    const matchesStock = !inStockOnly || Number(book.quantity || 0) > 0;

    return matchesSearch && matchesLanguage && matchesStock;
  })
  .sort((a, b) =>
    a.name.localeCompare(
      b.name,
      undefined,
      {
        sensitivity: 'base',
      }
    )
  );
  if (isMobile === null || authLoading) {
  return <LoadingSpinner />;
}

return (
  <>
{(!isMobile || isAdmin) && (
  <Navbar
    isAdmin={isAdmin}
    user={user}
  />
)}

{isMobile && !isAdmin && (
  <>
    <MobileHeader user={user} isAdmin={isAdmin} />
    <BottomNavbar
      isAdmin={isAdmin}
      user={user}
    />
  </>
)}

    <div className="container mt-3 mt-md-4 mb-5 pb-5">
        
     {/* Hero Welcome Banner */}
     <div
  className="card border-0 mb-4"
  style={{
    background:
      'linear-gradient(135deg, #422617 0%, #6d4223 60%, #85522b 100%)',
    color: 'white',
    borderRadius: '22px',
    boxShadow: '0 8px 30px rgba(66, 38, 23, 0.22)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    overflow: 'hidden',
    position: 'relative'
  }}
>
  <div className="card-body p-4 position-relative" style={{ zIndex: 1 }}>
    <div className="d-flex align-items-center justify-content-between mb-2">
      <span
        className="badge"
        style={{
          background: 'rgba(212, 175, 55, 0.25)',
          color: '#FBF3D5',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          padding: '6px 12px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: '600'
        }}
      >
        📚 Bhaktivedanta Rajavidyalaya
      </span>
      {user && (
        <span
          className="badge bg-success bg-opacity-75"
          style={{ borderRadius: '9999px', fontSize: '11px', padding: '5px 10px' }}
        >
          ● Active Devotee
        </span>
      )}
    </div>

    <h2 className="fw-bold mb-2" style={{ color: '#ffffff', letterSpacing: '0.2px' }}>
      Hare Krishna! {user?.email ? '🙏' : ''}
    </h2>

    <p className="mb-0 text-light opacity-90" style={{ fontSize: '14.5px', lineHeight: '1.5', maxWidth: '600px' }}>
      Explore sacred literature, study Vedic texts, and request library books easily from your mobile phone.
    </p>
  </div>
</div>

{/* 2x2 Grid on Mobile, 4x1 on Desktop */}
<div className="row g-3 g-md-4 mb-4">

  <div className="col-6 col-md-3">
    <div
      className="card border-0 pro-card h-100 text-white"
      style={{
        background: "linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)",
        borderRadius: "20px",
        boxShadow: "0 8px 22px rgba(29, 78, 216, 0.25)"
      }}
    >
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.5px', textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}>
            Catalog
          </span>
          <span style={{ fontSize: '20px' }}>📚</span>
        </div>
        <h2 className="fw-bold mb-0" style={{ color: '#ffffff', fontSize: '32px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {libraryStats.books}
        </h2>
        <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '13.5px', marginTop: '4px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          Total Titles
        </div>
      </div>
    </div>
  </div>

  <div className="col-6 col-md-3">
    <div
      className="card border-0 pro-card h-100 text-white"
      style={{
        background: "linear-gradient(135deg, #047857 0%, #34d399 100%)",
        borderRadius: "20px",
        boxShadow: "0 8px 22px rgba(4, 120, 87, 0.25)"
      }}
    >
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.5px', textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}>
            Devotees
          </span>
          <span style={{ fontSize: '20px' }}>👨‍🎓</span>
        </div>
        <h2 className="fw-bold mb-0" style={{ color: '#ffffff', fontSize: '32px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {libraryStats.students}
        </h2>
        <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '13.5px', marginTop: '4px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          Registered
        </div>
      </div>
    </div>
  </div>

  <div className="col-6 col-md-3">
    <div
      className="card border-0 pro-card h-100 text-white"
      style={{
        background: "linear-gradient(135deg, #b45309 0%, #fbbf24 100%)",
        borderRadius: "20px",
        boxShadow: "0 8px 22px rgba(180, 83, 9, 0.25)"
      }}
    >
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.5px', textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}>
            Diversity
          </span>
          <span style={{ fontSize: '20px' }}>🌍</span>
        </div>
        <h2 className="fw-bold mb-0" style={{ color: '#ffffff', fontSize: '32px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {libraryStats.languages}
        </h2>
        <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '13.5px', marginTop: '4px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          Languages
        </div>
      </div>
    </div>
  </div>

  <div className="col-6 col-md-3">
    <div
      className="card border-0 pro-card h-100 text-white"
      style={{
        background: "linear-gradient(135deg, #be123c 0%, #fb7185 100%)",
        borderRadius: "20px",
        boxShadow: "0 8px 22px rgba(190, 18, 60, 0.25)"
      }}
    >
      <div className="card-body p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.5px', textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}>
            Inventory
          </span>
          <span style={{ fontSize: '20px' }}>📦</span>
        </div>
        <h2 className="fw-bold mb-0" style={{ color: '#ffffff', fontSize: '32px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {libraryStats.copies}
        </h2>
        <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '13.5px', marginTop: '4px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          Total Copies
        </div>
      </div>
    </div>
  </div>

</div>

{/* Search & Touch Filters Section */}
<div
  className="card border-0 mb-4"
  style={{
    borderRadius: "20px",
    boxShadow: "0 6px 24px rgba(78, 52, 46, 0.08)",
    backgroundColor: "#ffffff",
    border: "1px solid #ebdcd0",
    padding: "20px"
  }}
>
  <div className="row g-3 align-items-center mb-3">
    <div className="col-12 col-md-8">
      <div style={{ position: "relative" }}>
        <i
          className="bi bi-search"
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#8c7b72',
            fontSize: '16px'
          }}
        ></i>
        <input
          type="text"
          placeholder="Search by book name, author, or keyword..."
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            paddingLeft: "44px",
            paddingRight: "40px",
            height: "48px",
            borderRadius: "14px",
            border: "1.5px solid #ebdcd0",
            fontSize: "15px",
            backgroundColor: "#fbf9f7"
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              fontSize: "18px",
              color: "#8c7b72",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>

    <div className="col-12 col-md-4">
      <select
        className="form-select d-none d-md-block"
        value={languageFilter}
        onChange={(e) => setLanguageFilter(e.target.value)}
        style={{
          height: "48px",
          borderRadius: "14px",
          border: "1.5px solid #ebdcd0",
          fontSize: "15px",
          backgroundColor: "#fbf9f7"
        }}
      >
        <option value="">🌍 All Languages</option>
        {[...new Set(books.map((b) => b.language?.trim().toLowerCase()).filter(Boolean))].map((lang) => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Mobile Horizontal Scrolling Filter Chips */}
  <div
    className="d-flex align-items-center gap-2 overflow-auto no-scrollbar pb-1"
    style={{ WebkitOverflowScrolling: 'touch' }}
  >
    <div
      onClick={() => setLanguageFilter('')}
      className={`filter-chip ${languageFilter === '' ? 'active' : ''}`}
    >
      <span>All Books</span>
      <span
        className="badge rounded-pill"
        style={{
          backgroundColor: languageFilter === '' ? 'rgba(255,255,255,0.3)' : '#f5ebe1',
          color: languageFilter === '' ? '#ffffff' : '#6f4e37',
          fontSize: '11px'
        }}
      >
        {books.length}
      </span>
    </div>

    {[...new Set(books.map((b) => b.language?.trim().toLowerCase()).filter(Boolean))].map((lang) => {
      const count = books.filter((b) => b.language?.trim().toLowerCase() === lang).length;
      const isSelected = languageFilter.toLowerCase() === lang;
      return (
        <div
          key={lang}
          onClick={() => setLanguageFilter(isSelected ? '' : lang)}
          className={`filter-chip ${isSelected ? 'active' : ''}`}
        >
          <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
          <span
            className="badge rounded-pill"
            style={{
              backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#f5ebe1',
              color: isSelected ? '#ffffff' : '#6f4e37',
              fontSize: '11px'
            }}
          >
            {count}
          </span>
        </div>
      );
    })}

    <div
      onClick={() => setInStockOnly(!inStockOnly)}
      className={`filter-chip ${inStockOnly ? 'active' : ''}`}
      style={{
        borderColor: inStockOnly ? '#059669' : '#ebdcd0',
        background: inStockOnly ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : '#ffffff',
        color: inStockOnly ? '#ffffff' : '#059669'
      }}
    >
      <i className={`bi ${inStockOnly ? 'bi-check-circle-fill' : 'bi-lightning-charge'}`}></i>
      <span>In Stock Only</span>
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

 <div className="table-responsive d-none d-md-block">
  <table className="table table-striped table-hover align-middle book-table">
       
       <thead
  style={{
    backgroundColor: '#6f4e37',
    color: 'white'
  }}
>
            <tr>
              <th>Book Name</th>
              <th>Author</th>
              <th>Language</th>
              <th className="d-none d-md-table-cell">
  Position
</th>
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
                <td className="d-none d-md-table-cell">
  {book.position}
</td>
                <td>{book.quantity}</td>

                <td>

  {isAdmin ? (

    <button
      onClick={() =>
        handleDeleteBook(book.id)
      }
      className="btn btn-danger btn-sm"
    >
      🗑 Delete
    </button>

  ) : !user ? (

    <button
  onClick={() => {
    alert("Please login to issue books.");
    window.location.href = "/login";
  }}
  className="btn btn-warning btn-sm"
>
  📚 Issue
</button>
  ) : (

    <button
      onClick={() =>
        handleRequestBook(book)
      }
      className="btn btn-primary btn-sm"
      disabled={book.quantity <= 0}
    >
      {book.quantity <= 0
        ? "Out of Stock"
        : "📚 Request"}
    </button>

  )}

</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> 
               {/* Mobile Book Cards */}
<div className="d-md-none">

  {filteredBooks.length === 0 ? (
    <div
      className="text-center py-5 px-3"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        border: '1px dashed #ebdcd0',
      }}
    >
      <div style={{ fontSize: '38px', marginBottom: '8px' }}>🔍</div>
      <h6 className="fw-bold" style={{ color: '#6f4e37' }}>
        No Books Found
      </h6>
      <p className="text-muted small mb-0">
        Try adjusting your search query or language filter.
      </p>
    </div>
  ) : (
    filteredBooks.map((book) => {
      const isAvailable = (book.quantity ?? 0) > 0;
      return (
        <div
          key={book.id}
          className="card pro-card mb-3 border-0"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            boxShadow: '0 4px 18px rgba(78, 52, 46, 0.08)',
            border: '1px solid #ebdcd0',
            overflow: 'hidden',
          }}
        >
          <div className="card-body p-3">

            {/* Header row with language, position, and availability badge */}
            <div className="d-flex align-items-center justify-content-between gap-1 mb-2">
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: '#f5ebe1',
                    color: '#6f4e37',
                    fontWeight: '600',
                    fontSize: '11px',
                    padding: '5px 10px',
                  }}
                >
                  🌐 {book.language || 'English'}
                </span>
                {book.position && (
                  <span
                    className="badge rounded-pill bg-light text-secondary border"
                    style={{ fontSize: '11px', padding: '5px 9px' }}
                  >
                    📍 Shelf: {book.position}
                  </span>
                )}
              </div>

              {isAvailable ? (
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: '#e6f4ea',
                    color: '#137333',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '5px 9px',
                  }}
                >
                  🟢 In Stock: {book.quantity}
                </span>
              ) : (
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: '#fce8e6',
                    color: '#c5221f',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '5px 9px',
                  }}
                >
                  🔴 Out of Stock
                </span>
              )}
            </div>

            {/* Book Title */}
            <h6
              className="fw-bold mb-1"
              style={{
                color: '#2e1e17',
                fontSize: '16px',
                lineHeight: '1.35',
              }}
            >
              {book.name}
            </h6>

            {/* Author */}
            <div
              className="small mb-3"
              style={{
                color: '#7a5a4c',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <i className="bi bi-pen-fill" style={{ fontSize: '11px', opacity: 0.8 }}></i>
              <span>{book.author}</span>
            </div>

            {/* Action Button */}
            {!user ? (
              <button
                type="button"
                onClick={() => {
                  setCustomAlert('Please sign in to request or issue library books.');
                  window.location.href = '/login';
                }}
                className="btn btn-touch w-100"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #ba9425 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.28)',
                }}
              >
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Sign In to Request</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleRequestBook(book)}
                className="btn btn-touch w-100"
                disabled={!isAvailable}
                style={{
                  background: isAvailable
                    ? 'linear-gradient(135deg, #6f4e37 0%, #8b5e3c 100%)'
                    : '#e0d8d0',
                  color: isAvailable ? '#ffffff' : '#8c7b72',
                  border: 'none',
                  fontSize: '14px',
                  boxShadow: isAvailable ? '0 4px 12px rgba(111, 78, 55, 0.28)' : 'none',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                }}
              >
                <i className={`bi ${isAvailable ? 'bi-bookmark-plus-fill' : 'bi-x-circle'}`}></i>
                <span>{isAvailable ? '📚 Request This Book' : 'Out of Stock'}</span>
              </button>
            )}

          </div>
        </div>
      );
    })
  )}

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
        <CustomAlert
  message={customAlert}
  onClose={() => setCustomAlert('')}
/>
</>
  );
}
