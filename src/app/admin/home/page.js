'use client';
import { db } from '../../../firebase';
import { useState, useEffect } from 'react';


import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

export default function AdminHomePage() {
  const [activeTab, setActiveTab] =
    useState('addbook');
const [books, setBooks] = useState([]);

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

const [languageFilter,
  setLanguageFilter] =
  useState('');
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

const handleAddBook = async (e) => {
  e.preventDefault();

  if (!name || !author) {
    return alert(
      'Book Name and Author are required.'
    );
  }

  const duplicateBook =
    books.find(
      (book) =>
        book.name
          ?.trim()
          .toLowerCase() ===
          name
            .trim()
            .toLowerCase() &&
        book.author
          ?.trim()
          .toLowerCase() ===
          author
            .trim()
            .toLowerCase() &&
        book.language
          ?.trim()
          .toLowerCase() ===
          language
            .trim()
            .toLowerCase()
    );

  if (duplicateBook) {
    return alert(
      'Book already exists in library'
    );
  }

  await addDoc(
    collection(db, 'books'),
    {
      name,
      author,
      language,
      position,
      quantity: Number(quantity)
    }
  );

  setName('');
  setAuthor('');
  setLanguage('');
  setPosition('');
  setQuantity(1);

  alert('Book added successfully');
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

      const bookName =
        cols[0]
          ?.trim()
          .split(' ')
          .map(
            word =>
              word.charAt(
                0
              ) +
              word
                .slice(1)
                .toLowerCase()
          )
          .join(' ');

      const uniqueKey =
        `${bookName}|${cols[1]
          ?.trim()
          .toLowerCase()}|${cols[2]
          ?.trim()
          .toLowerCase()}`;

      const duplicateBook =
        books.find(
          (book) =>
            book.name
              ?.trim()
              .toLowerCase() ===
              bookName
                .trim()
                .toLowerCase() &&
            book.author
              ?.trim()
              .toLowerCase() ===
              cols[1]
                ?.trim()
                .toLowerCase() &&
            book.language
              ?.trim()
              .toLowerCase() ===
              cols[2]
                ?.trim()
                .toLowerCase()
        ) ||
        processedBooks.has(
          uniqueKey
        );

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
        collection(
          db,
          'books'
        ),
        {
          name: bookName,
          author:
            cols[1]?.trim(),
          language:
            cols[2]?.trim(),
          position:
            cols[3]?.trim(),
          quantity: Number(
            cols[4]?.trim()
          )
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

const filteredBooks =
  books.filter((book) => {

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
  });
  return (
    <>
  <Navbar
    isAdmin={true}
    user={{
      email: 'bvrvlibrary@gmail.com'
    }}
  />

  <div className="container mt-4">
   

      <h3 className="mb-4">
        Admin Home
      </h3>

      <div className="row">

        <div className="col-md-3">

          <div className="list-group">

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
              Add Book
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
              Bulk Upload
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
              Library Books
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

    <div className="card p-3 mb-3">

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

    <div className="card p-3">

      <h4 className="mb-3">
        Library Books
      </h4>

      <div className="table-responsive">

        <table className="table table-bordered">

          <thead>
            <tr>
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
                <tr
                  key={book.id}
                >
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
        </div>

      </div>
 
  </div>
</>
  );
}
