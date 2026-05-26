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
      
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
