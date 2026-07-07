import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import BootstrapClient from './BootstrapClient';

export const metadata = {
  title: 'Library Management System',
  description: 'PRD Cloud Native LMS App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#f8f9fa' }}>

        <BootstrapClient />

        <main className="container-fluid p-0">
          {children}
        </main>

      </body>
    </html>
  );
}
