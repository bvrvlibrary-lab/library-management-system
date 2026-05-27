import Navbar from './components/Navbar';
export const metadata = {
  title: 'Library Management System',
  description: 'PRD Cloud Native LMS App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>

        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />

      </head>

      <body style={{ backgroundColor: '#f8f9fa' }}>

  <Navbar />

  <main className="container-fluid p-0">
    {children}
  </main>

</body>    </html>
  );
}
