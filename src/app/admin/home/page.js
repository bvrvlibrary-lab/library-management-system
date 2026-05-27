'use client';

import { useState, useEffect } from 'react';

import { db } from '../../../firebase';

import {
  collection,
  onSnapshot,
  addDoc
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
  return (
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
              <h4>
                Bulk Upload
              </h4>
              <p>
                Bulk Upload
                section will
                come here.
              </p>
            </div>
          )}

          {activeTab ===
            'librarybooks' && (
            <div className="card p-3">
              <h4>
                Library Books
              </h4>
              <p>
                Library Books
                section will
                come here.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
