'use client';
import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';

import {
  collection,
  onSnapshot
} from 'firebase/firestore';

export default function HistoryPage() {
  const [activeTab, setActiveTab] =
    useState('issued');

  const [requests, setRequests] =
    useState([]);

  const [user, setUser] =
    useState(null);

  useEffect(() => {
    const currentUser =
      auth.currentUser;

    if (currentUser) {
      setUser(currentUser);
    }

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          'bookRequests'
        ),
        (snapshot) => {
          setRequests(
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

  const issuedBooks =
    requests.filter(
      (req) =>
        req.studentId ===
          user?.uid &&
        req.status === 'Issued'
    );

  const returnedBooks =
    requests.filter(
      (req) =>
        req.studentId ===
          user?.uid &&
        req.status ===
          'Returned'
    );

  return (
    <div className="container return (
  <>
    <Navbar
      isAdmin={false}
      user={auth.currentUser}
    />

    <div className="container mt-4">
      <h3 className="mb-4">
        Book History
      </h3>

      <div className="row">

        <div className="col-md-3 mb-3">
          <div className="list-group">

            <button
              className={`list-group-item list-group-item-action ${
                activeTab ===
                'issued'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'issued'
                )
              }
            >
              Issued Books
            </button>

            <button
              className={`list-group-item list-group-item-action ${
                activeTab ===
                'returned'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'returned'
                )
              }
            >
              Returned Books
            </button>

          </div>
        </div>

        <div className="col-md-9">

          {activeTab ===
            'issued' && (
            <>
              {issuedBooks.length ===
              0 ? (
                <p>
                  No books are
                  issued.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered">

                    <thead>
                      <tr>
                        <th>
                          Book
                        </th>
                        <th>
                          Author
                        </th>
                        <th>
                          Due Date
                        </th>
                        <th>
                          Renewals
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {issuedBooks.map(
                        (book) => (
                          <tr
                            key={
                              book.id
                            }
                          >
                            <td>
                              {
                                book.bookName
                              }
                            </td>

                            <td>
                              {
                                book.author
                              }
                            </td>

                            <td>
                              {book.dueDate
                                ? new Date(
                                    book.dueDate.seconds *
                                      1000
                                  ).toLocaleDateString()
                                : '-'}
                            </td>

                            <td>
                              {book.renewalCount ||
                                0}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>
                </div>
              )}
            </>
          )}

          {activeTab ===
            'returned' && (
            <>
              {returnedBooks.length >
                0 && (
                <div className="table-responsive">
                  <table className="table table-bordered">

                    <thead>
                      <tr>
                        <th>
                          Book
                        </th>
                        <th>
                          Author
                        </th>
                        <th>
                          Return Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {returnedBooks.map(
                        (book) => (
                          <tr
                            key={
                              book.id
                            }
                          >
                            <td>
                              {
                                book.bookName
                              }
                            </td>

                            <td>
                              {
                                book.author
                              }
                            </td>

                            <td>
                              {book.returnDate
                                ? new Date(
                                    book.returnDate.seconds *
                                      1000
                                  ).toLocaleDateString()
                                : '-'}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
            </>
  );
}
