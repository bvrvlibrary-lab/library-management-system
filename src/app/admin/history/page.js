'use client';

import { useState } from 'react';

export default function AdminHistoryPage() {
  const [activeTab, setActiveTab] =
    useState('approvalpending');

  return (
    <div className="container mt-4">

      <h3 className="mb-4">
        Admin History
      </h3>

      <div className="row">

        <div className="col-md-3">

          <div className="list-group">

            <button
              className={`list-group-item list-group-item-action ${
                activeTab ===
                'approvalpending'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'approvalpending'
                )
              }
            >
              Approval Pending
            </button>

            <button
              className={`list-group-item list-group-item-action ${
                activeTab ===
                'registrationapproval'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(
                  'registrationapproval'
                )
              }
            >
              Registration Approval
            </button>

          </div>

        </div>

        <div className="col-md-9">

          {activeTab ===
            'approvalpending' && (
            <div className="card p-3">
              Approval Pending
            </div>
          )}

          {activeTab ===
            'registrationapproval' && (
            <div className="card p-3">
              Registration Approval
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
