'use client';

export default function CustomAlert({
  message,
  onClose
}) {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          width: '90%',
          maxWidth: '450px',
          padding: '30px',
          borderRadius: '18px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
      >
        <h3
          style={{
            color: '#6f4e37',
            marginBottom: '20px'
          }}
        >
          Hare Krishna!
        </h3>

        <p
          style={{
            fontSize: '17px',
            marginBottom: '25px'
          }}
        >
          {message}
        </p>

        <div style={{ textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#6f4e37',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 25px',
              fontWeight: 'bold'
            }}
          >
            OK
          </button>
        </div>

      </div>
    </div>
  );
}
