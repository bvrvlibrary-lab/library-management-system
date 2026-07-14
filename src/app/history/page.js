'use client';
import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';

import {
  onAuthStateChanged
} from 'firebase/auth';

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

const [subject, setSubject] =
  useState("");

const [category, setCategory] =
  useState("General Feedback");

const [feedback, setFeedback] =
  useState("");
  
  useEffect(() => {
  const unsubscribeAuth =
  onAuthStateChanged(
    auth,
    (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    }
  );
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
return () => {
  unsubscribe();
  unsubscribeAuth();
};
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
<button
  className={`list-group-item list-group-item-action ${
    activeTab === "feedback"
      ? "active"
      : ""
  }`}
  onClick={() =>
    setActiveTab("feedback")
  }
>
  💬 Feedback
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
                 <table className="table table-bordered history-table">

                  <thead className="history-header">
  <tr>
    <th style={{ width: "45%" }}>
      Book
    </th>

    <th style={{ width: "35%" }}>
      Author
    </th>

    <th
      className="text-center"
      style={{ width: "130px" }}
    >
      Due Date
    </th>

    <th
      className="text-center"
      style={{ width: "100px" }}
    >
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

      <td
  className="text-center"
  style={{ width: "130px" }}
>
  {book.dueDate
    ? new Date(
        book.dueDate.seconds * 1000
      ).toLocaleDateString()
    : '-'}
</td>

<td
  className="text-center"
  style={{ width: "100px" }}
>
  {book.renewalCount || 0}
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
                  <table className="table table-bordered history-table">

<thead className="history-header">
                      <tr>
                        <th>
                          Book
                        </th>
                        <th>
                          Author
                        </th>
                        <th className="text-center">
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

                         <td className="text-center">
  {book.returnDate
    ? new Date(
        book.returnDate.seconds * 1000
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-"}
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
{activeTab === "feedback" && (

  <div className="card shadow-sm">

    <div className="card-header history-header">
      💬 Feedback, Suggestions & Book Recommendations
    </div>

    <div className="card-body">

      <div className="mb-3">

        <label className="form-label">
          Subject
        </label>

      <input
  type="text"
  className="form-control"
  value={subject}
  onChange={(e) =>
    setSubject(e.target.value)
  }
/>

      </div>

      <div className="mb-3">

        <label className="form-label">
          Category
        </label>

      <select
  className="form-select"
  value={category}
  onChange={(e) =>
    setCategory(e.target.value)
  }
>

          <option>
            General Feedback
          </option>

          <option>
            Library Service
          </option>

          <option>
            Website Issue
          </option>

          <option>
            Book Recommendation
          </option>

          <option>
            Other
          </option>

        </select>

      </div>

      <div className="mb-3">

        <label className="form-label">
          Feedback
        </label>

      <textarea
  rows="6"
  className="form-control"
  value={feedback}
  onChange={(e) =>
    setFeedback(e.target.value)
  }
/>

      </div>

      <button className="btn btn-bvrv">
        Submit Feedback
      </button>

    </div>

  </div>

)}
               </div>

       
      </div>
    </div>
            </>
  );
}
