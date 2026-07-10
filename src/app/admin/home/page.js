  'use client';

import Navbar from '../../../components/Navbar';
import { db } from '../../../firebase';
import { useState, useEffect } from 'react';
import { auth } from '../../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from 'firebase/firestore';
import {
  formatText,
  formatLanguage,
  formatPosition
} from "../../../lib/formatBookData";
export default function AdminHomePage() {
  const [activeTab, setActiveTab] =
    useState('addbook');
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] =
  useState(true);
const [books, setBooks] = useState([]);

const [selectedBooks, setSelectedBooks] =
  useState([]);
  
const [name, setName] = useState('');
const [author, setAuthor] = useState('');
const [language, setLanguage] = useState('');
const [position, setPosition] = useState('');
const [quantity, setQuantity] =
  useState(1);
  const [csvFile, setCsvFile] =
  useState(null);
  const [searchTerm, setSearchTerm] =
  useState('');
const [editingBook, setEditingBook] =
  useState(null);

const [editName, setEditName] =
  useState('');

const [editAuthor, setEditAuthor] =
  useState('');

const [editLanguage,
    setEditLanguage] =
  useState('');

const [editPosition,
    setEditPosition] =
  useState('');

const [editQuantity,
    setEditQuantity] =
  useState('');
  const [students, setStudents] =
  useState([]);
const [languageFilter,
  setLanguageFilter] =
  useState('');
  useEffect(() => {

  const unsubscribe =
    onAuthStateChanged(
      auth,
      (user) => {

        if (!user) {
          router.replace('/login');
          return;
        }

        if (
          user.email?.toLowerCase() !==
          'bvrvlibrary@gmail.com'
        ) {
          router.replace('/');
          return;
        }

        setCheckingAuth(false);

      }
    );

  return () => unsubscribe();

}, [router]);
  useEffect(() => {
  const unsubscribe =
    onSnapshot(
      collection(db, 'books'),
      (snapshot) => {
        setBooks(
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );

  return () => unsubscribe();
}, []);
useEffect(() => {

  const unsubscribe =
    onSnapshot(
      collection(db, 'users'),
      (snapshot) => {

        setStudents(
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data()
            })
          )
        );

      }
    );

  return () => unsubscribe();

}, []);
const handleAddBook = async (e) => {
  e.preventDefault();

  // Format values
  const formattedName = formatText(name);
  const formattedAuthor = formatText(author);
  const formattedLanguage = formatLanguage(language);
  const formattedPosition = formatPosition(position);

  if (!formattedName || !formattedAuthor) {
    return alert(
      "Book Name and Author are required."
    );
  }

  // Duplicate Check (Book + Author + Language)
  const duplicateBook = books.find(
    (book) =>
      formatText(book.name) ===
        formattedName &&

      formatText(book.author) ===
        formattedAuthor &&

      formatLanguage(book.language) ===
        formattedLanguage
  );

  if (duplicateBook) {
    return alert(
      "This book already exists.\n\nIf required you can increase the quantity."
    );
  }

  await addDoc(
    collection(db, "books"),
    {
      name: formattedName,
      author: formattedAuthor,
      language: formattedLanguage,
      position: formattedPosition,
      quantity: Number(quantity)
    }
  );

  setName("");
  setAuthor("");
  setLanguage("");
  setPosition("");
  setQuantity(1);

  alert("Book added successfully");
};
  const handleBulkUpload = async () => {
  if (!csvFile) {
    return alert(
      'Please select a CSV file'
    );
  }

  const reader =
    new FileReader();

  reader.onload = async (e) => {
    const text =
      e.target.result;

    const rows = text
      .split('\n')
      .filter(row =>
        row.trim()
      );

    let successCount = 0;
    let duplicateCount = 0;

    const processedBooks =
      new Set();

    for (
      let i = 1;
      i < rows.length;
      i++
    ) {
      const cols =
        rows[i].split(',');

      if (
        cols.length < 5
      )
        continue;

      const bookName = formatText(cols[0]);

const author = formatText(cols[1]);

const language = formatLanguage(cols[2]);

const position = formatPosition(cols[3]);

      const uniqueKey =
  `${bookName}|${author}|${language}`;  

      const duplicateBook =
  books.find(
    (book) =>
      formatText(book.name) ===
        bookName &&

      formatText(book.author) ===
        author &&

      formatLanguage(book.language) ===
        language
  ) ||
  processedBooks.has(uniqueKey);
        

      if (
        duplicateBook
      ) {
        duplicateCount++;
        continue;
      }

      processedBooks.add(
        uniqueKey
      );

   await addDoc(
  collection(db, "books"),
  {
    name: bookName,
    author: author,
    language: language,
    position: position,
    quantity: Number(cols[4]?.trim())
  }
);
      successCount++;
    }

   alert(
  `Uploaded ${successCount} books successfully\n\nSkipped ${duplicateCount} duplicates`
);

setCsvFile(null);

const fileInput =
  document.getElementById(
    'csvUpload'
  );

if (fileInput) {
  fileInput.value = '';
}
  };

  reader.readAsText(
    csvFile
  );
};
  
  const handleExportBooks = () => {

  const headers = [
    "Book Name",
    "Author",
    "Language",
    "Position",
    "Quantity"
  ];

  const rows = books.map((book) => [
    book.name,
    book.author,
    book.language,
    book.position,
    book.quantity
  ]);

  const csvContent = [
    headers,
    ...rows
  ]
    .map((row) =>
      row.join(",")
    )
    .join("\n");

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;"
    }
  );

  const link =
    document.createElement("a");

  const url =
    URL.createObjectURL(blob);

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  link.href = url;

  link.download =
    `books_backup_${today}.csv`;

  link.click();

  URL.revokeObjectURL(url);

};
  
  const handleDeleteBook = async (
  id
) => {
  if (
    confirm(
      'Are you sure you want to delete this book?'
    )
  ) {
    await deleteDoc(
      doc(db, 'books', id)
    );
  }
};

  const handleDeleteSelectedBooks = async () => {

  if (selectedBooks.length === 0) {
    return;
  }

  const confirmed = window.confirm(
    `Delete ${selectedBooks.length} selected book(s)?\n\nThis action cannot be undone.`
  );

  if (!confirmed) return;

  try {

    for (const id of selectedBooks) {

      await deleteDoc(
        doc(db, "books", id)
      );

    }

    setSelectedBooks([]);

    alert(
      "Selected books deleted successfully."
    );

  } catch (error) {

    console.error(error);

    alert(
      "Failed to delete selected books."
    );

  }

};
  
const handleUpdateBook =
  async () => {

    try {

      await updateDoc(
  doc(
    db,
    "books",
    editingBook.id
  ),
  {
    name: formatText(editName),
    author: formatText(editAuthor),
    language: formatLanguage(editLanguage),
    position: formatPosition(editPosition),
    quantity: Number(editQuantity)
  }
);
       

      alert(
        'Book updated successfully'
      );

      setEditingBook(
        null
      );

    } catch (error) {

      console.error(
        error
      );

      alert(
        'Failed to update book'
      );

    }
  };
  const filteredBooks = books
  .filter((book) => {

    const matchesSearch =
      book.name
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        ) ||

      book.author
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        );

    const matchesLanguage =
      languageFilter === '' ||

      book.language
        ?.trim()
        .toLowerCase() ===
      languageFilter
        .trim()
        .toLowerCase();

    return (
      matchesSearch &&
      matchesLanguage
    );

  })
  .sort((a, b) =>
    a.name.localeCompare(
      b.name,
      undefined,
      {
        sensitivity: 'base'
      }
    )
  );
if (checkingAuth) {
  return null;
}
  return (
    <>
<Navbar
  isAdmin={true}
  user={{
    email: 'bvrvlibrary@gmail.com'
  }}
/>

<div
  className="container-fluid py-4"
  style={{
    minHeight: '100vh',
    background:
      'linear-gradient(135deg,#f4f7fc,#e9f2ff)'
  }}
>
   

      <div className="mb-4">

  <h1
    className="fw-bold mb-1"
    style={{
      color: '#1e293b'
    }}
  >
    📚 Library Dashboard
  </h1>

  <p
    style={{
      color: '#64748b',
      fontSize: '16px'
    }}
  >
    Manage books, students and circulation
  </p>

</div>
<div className="row mb-4">

  <div className="col-md-3 mb-3">

    <div
      className="card border-0 shadow"
      style={{
        background:
          'linear-gradient(135deg,#0d6efd,#4dabf7)',
        color: 'white',
        borderRadius: '18px'
      }}
    >
      <div className="card-body">

        <h6>
          📚 Total Books
        </h6>

        <h2 className="fw-bold">
          {books.length}
        </h2>

      </div>
    </div>

  </div>

  <div className="col-md-3 mb-3">

    <div
      className="card border-0 shadow"
      style={{
        background:
          'linear-gradient(135deg,#198754,#51cf66)',
        color: 'white',
        borderRadius: '18px'
      }}
    >
      <div className="card-body">

        <h6>
          👥 Students
        </h6>

        <h2 className="fw-bold">
          {students.length}
        </h2>

      </div>
    </div>

  </div>

  <div className="col-md-3 mb-3">

    <div
      className="card border-0 shadow"
      style={{
        background:
          'linear-gradient(135deg,#fd7e14,#ffc078)',
        color: 'white',
        borderRadius: '18px'
      }}
    >
      <div className="card-body">

        <h6>
          📖 Languages
        </h6>

        <h2 className="fw-bold">

          {
            [
              ...new Set(
                books.map(
                  (b) =>
                    b.language
                )
              )
            ].length
          }

        </h2>

      </div>
    </div>

  </div>

  <div className="col-md-3 mb-3">

    <div
      className="card border-0 shadow"
      style={{
        background:
          'linear-gradient(135deg,#dc3545,#ff6b6b)',
        color: 'white',
        borderRadius: '18px'
      }}
    >
      <div className="card-body">

        <h6>
          📦 Stock
        </h6>

        <h2 className="fw-bold">

          {
            books.reduce(
              (
                total,
                book
              ) =>
                total +
                Number(
                  book.quantity ||
                  0
                ),
              0
            )
          }

        </h2>

      </div>
    </div>

  </div>

</div>
      <div className="row">

        <div className="col-md-3">

          <div
  className="list-group shadow"
  style={{
    borderRadius: '18px',
    overflow: 'hidden',
    background: '#fff'
  }}
>

            <button
              className={`list-group-item list-group-item-action ${
                activeTab === 'addbook'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'addbook'
                )
              }
            >
              📚 Add Book
            </button>

            <button
              className={`list-group-item list-group-item-action ${
                activeTab ===
                'bulkupload'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'bulkupload'
                )
              }
            >
              📂 Bulk Upload
            </button>

            <button
              className={`list-group-item list-group-item-action ${
                activeTab ===
                'librarybooks'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'librarybooks'
                )
              }
            >
             📖 Library Books
            </button>
<button
  className={`list-group-item list-group-item-action ${
    activeTab === 'exportbooks'
      ? 'active'
      : ''
  }`}
  onClick={() =>
    setActiveTab('exportbooks')
  }
>
  💾 Export Books
</button>
          </div>

        </div>

        <div className="col-md-9">

          {activeTab ===
  'addbook' && (
  <div className="card p-3">

    <h4 className="mb-3">
      Add Book
    </h4>

    <form
      onSubmit={
        handleAddBook
      }
    >
      <div className="row">

        <div className="col-md-4 mb-2">
          <input
            type="text"
            placeholder="Book Name"
            className="form-control"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            required
          />
        </div>

        <div className="col-md-3 mb-2">
          <input
            type="text"
            placeholder="Author"
            className="form-control"
            value={author}
            onChange={(e) =>
              setAuthor(
                e.target.value
              )
            }
            required
          />
        </div>

        <div className="col-md-2 mb-2">
          <input
            type="text"
            placeholder="Language"
            className="form-control"
            value={language}
            onChange={(e) =>
              setLanguage(
                e.target.value
              )
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
              setPosition(
                e.target.value
              )
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
              setQuantity(
                e.target.value
              )
            }
          />
        </div>

      </div>

      <button
        type="submit"
        className="btn btn-success"
      >
        Add Book
      </button>

    </form>

  </div>
)}

          {activeTab ===
            'bulkupload' && (
            <div className="card p-3">
             <h4 className="mb-3">
  Bulk Upload
</h4>

<input
  id="csvUpload"
  type="file"
  accept=".csv"
  className="form-control mb-3"
  onChange={(e) =>
    setCsvFile(
      e.target.files[0]
    )
  }
/>
<div className="d-flex gap-2">

  <button
    onClick={
      handleBulkUpload
    }
    className="btn btn-success"
  >
    Upload CSV
  </button>

  <a
    href="/Bulk_Upload.csv"
    download
    className="btn btn-outline-primary"
  >
    Download Sample CSV
  </a>

</div>
            </div>
          )}

          {activeTab ===
  'librarybooks' && (
  <div>

    <div
  className="card border-0 shadow-sm p-3 mb-3"
  style={{
    borderRadius: '15px',
    background:
      'linear-gradient(135deg,#f8fbff,#eef5ff)'
  }}
>

      <div className="row">

        <div className="col-md-8 mb-2">
          <input
            type="text"
            placeholder="Search by Book Name or Author"
            className="form-control"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />
        </div>

        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={languageFilter}
            onChange={(e) =>
              setLanguageFilter(
                e.target.value
              )
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
            )].map(
              (language) => (
                <option
                  key={language}
                  value={language}
                >
                  {language.charAt(
                    0
                  ).toUpperCase() +
                    language.slice(
                      1
                    )}
                </option>
              )
            )}

          </select>
        </div>

      </div>

    </div>

   <div
  className="card border-0 shadow-sm p-4"
  style={{
    borderRadius: '15px'
  }}
>
  <div
  style={{
    height: '5px',
    background:
      'linear-gradient(90deg,#0d6efd,#20c997)',
    borderRadius: '10px',
    marginBottom: '15px'
  }}
></div>

      <h4 className="mb-3">
        Library Books
      </h4>

  <div className="d-flex justify-content-between align-items-center mb-3">

  <div>

    <strong>
      Selected: {selectedBooks.length} Book(s)
    </strong>

  </div>

  <button
    className="btn btn-danger"
    disabled={selectedBooks.length === 0}
    onClick={handleDeleteSelectedBooks}
  >
    🗑 Delete Selected
  </button>

</div>

      <div className="table-responsive">

        <table className="table table-hover align-middle">

        <thead className="table-dark">
  <tr>

    <th style={{ width: "50px" }}>
      <input
        type="checkbox"
        checked={
          books.length > 0 &&
          selectedBooks.length === books.length
        }
        onChange={(e) => {

          if (e.target.checked) {

            setSelectedBooks(
              books.map(book => book.id)
            );

          } else {

            setSelectedBooks([]);

          }

        }}
      />
    </th>

    <th>
      Book Name
    </th>

    <th>
      Author
    </th>

    <th>
      Language
    </th>

    <th>
      Position
    </th>

    <th>
      Quantity
    </th>

    <th>
      Action
    </th>

  </tr>
</thead>

          <tbody>

            {filteredBooks.map(
              (book) => (
               <tr key={book.id}>

  <td>
    <input
      type="checkbox"
      checked={selectedBooks.includes(book.id)}
      onChange={(e) => {

        if (e.target.checked) {

          setSelectedBooks([
            ...selectedBooks,
            book.id
          ]);

        } else {

          setSelectedBooks(
            selectedBooks.filter(
              (id) => id !== book.id
            )
          );

        }

      }}
    />
  </td>

  <td>
    {book.name}
  </td>

  <td>
    {book.author}
  </td>

  <td>
    {book.language}
  </td>

  <td>
    {book.position}
  </td>

  <td>
    {book.quantity}
  </td>

  <td>

    <div className="d-flex gap-2">

      <button
        onClick={() => {
          setEditingBook(book);

          setEditName(book.name);

          setEditAuthor(book.author);

          setEditLanguage(book.language);

          setEditPosition(book.position);

          setEditQuantity(book.quantity);
        }}
        className="btn btn-primary btn-sm"
      >
        Edit
      </button>

      <button
        onClick={() =>
          handleDeleteBook(book.id)
        }
        className="btn btn-danger btn-sm"
      >
        Delete
      </button>

    </div>

  </td>

</tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  </div>
)}
  {editingBook && (

  <div
    className="modal d-block"
    style={{
      background:
        'rgba(0,0,0,0.5)'
    }}
  >

    <div className="modal-dialog">

      <div className="modal-content">

        <div className="modal-header">

          <h5>
            Edit Book
          </h5>

        </div>

        <div className="modal-body">

          <input
            className="form-control mb-2"
            value={editName}
            onChange={(e) =>
              setEditName(
                e.target.value
              )
            }
            placeholder="Book Name"
          />

          <input
            className="form-control mb-2"
            value={editAuthor}
            onChange={(e) =>
              setEditAuthor(
                e.target.value
              )
            }
            placeholder="Author"
          />

          <input
            className="form-control mb-2"
            value={editLanguage}
            onChange={(e) =>
              setEditLanguage(
                e.target.value
              )
            }
            placeholder="Language"
          />

          <input
            className="form-control mb-2"
            value={editPosition}
            onChange={(e) =>
              setEditPosition(
                e.target.value
              )
            }
            placeholder="Position"
          />

          <input
            type="number"
            className="form-control"
            value={editQuantity}
            onChange={(e) =>
              setEditQuantity(
                e.target.value
              )
            }
            placeholder="Quantity"
          />

        </div>

        <div className="modal-footer">

          <button
            className="btn btn-secondary"
            onClick={() =>
              setEditingBook(
                null
              )
            }
          >
            Cancel
          </button>

          <button
            className="btn btn-success"
            onClick={
              handleUpdateBook
            }
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>

  </div>

)}
  {activeTab === 'exportbooks' && (

<div className="card shadow-sm p-4">

  <h2
    className="mb-3"
    style={{
      color: "#6f4e37",
      fontWeight: "700"
    }}
  >
    💾 Export Books
  </h2>

  <p className="text-muted">
    Download a complete backup of all library books in CSV format.
    This file can be opened in Microsoft Excel and is compatible
    with the Bulk Upload feature.
  </p>

  <button
    className="btn btn-success btn-lg"
    onClick={handleExportBooks}
  >
    ⬇️ Download All The Books
  </button>

</div>

)}
        </div>

      </div>
 
  </div>
</>
  );
}
