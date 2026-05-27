'use client';

import { useState } from 'react';

export default function AdminHomePage() {
  const [activeTab, setActiveTab] =
    useState('addbook');

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
              <h4>Add Book</h4>
              <p>
                Add Book section
                will come here.
              </p>
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
