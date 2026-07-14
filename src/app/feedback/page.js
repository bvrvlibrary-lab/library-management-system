'use client';

export default function FeedbackPage() {

  return (

    <div
      style={{
        minHeight: '100vh',
        background: '#f5f3ef',
        padding: '40px'
      }}
    >

      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          background: '#fff',
          borderRadius: '15px',
          padding: '35px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
        }}
      >

        <h2
          style={{
            color: '#6f4e37',
            marginBottom: '10px'
          }}
        >
          💬 Feedback, Suggestions & Book Recommendations
        </h2>

        <p
          style={{
            color: '#666',
            marginBottom: '30px'
          }}
        >
          We value your suggestions and feedback to improve the BVRV Library.
        </p>

        <input
          type="text"
          placeholder="Subject"
          style={inputStyle}
        />

        <select
          style={inputStyle}
          defaultValue=""
        >
          <option value="" disabled>
            Select Category
          </option>

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

        <textarea
          placeholder="Write your feedback..."
          rows="8"
          style={{
            ...inputStyle,
            resize: 'vertical'
          }}
        />

        <button
          style={buttonStyle}
        >
          📩 Submit Feedback
        </button>

      </div>

    </div>

  );

}

const inputStyle = {

  width: '100%',

  padding: '14px',

  marginBottom: '20px',

  border: '1px solid #ccc',

  borderRadius: '8px',

  fontSize: '15px'

};

const buttonStyle = {

  width: '100%',

  padding: '15px',

  background: '#6f4e37',

  color: '#fff',

  border: 'none',

  borderRadius: '8px',

  fontSize: '18px',

  fontWeight: 'bold',

  cursor: 'pointer'

};
