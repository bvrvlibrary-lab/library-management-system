export const metadata = {
  title: 'Library Management System',
  description: 'PRD Cloud Native LMS App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* We use Bootstrap CSS for clean styling without writing heavy custom styles */}
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
          rel="stylesheet" 
        />
      </head>
      <body style={{ backgroundColor: '#f8f9fa' }}>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
          <div className="container">
            <a className="navbar-brand" href="/">LMS Portal</a>
            <div className="navbar-nav">
              <a className="nav-link" href="/">Home</a>
              <a className="nav-link" href="/database">Physical Books</a>
              <a className="nav-link" href="/admin/dashboard">Admin Panel</a>
            </div>
          </div>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
