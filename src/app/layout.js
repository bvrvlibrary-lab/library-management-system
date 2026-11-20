import './globals.css';
import ServiceWorkerRegister from '../components/ServiceWorkerRegister';
import { AlertProvider } from '../components/CustomAlert';

export const metadata = {
  title: "Bhaktivedanta Rajavidyalaya Library",
  description:
    "Bhaktivedanta Rajavidyalaya Library Management System",

  manifest: "/manifest.json",

  themeColor: "#6f4e37",

  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },

  appleWebApp: {
    capable: true,
    title: "BVRV Library",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        {/* Bootstrap Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        {/* Bootstrap JS */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          defer
        ></script>
      </head>

      <body style={{ background: 'linear-gradient(180deg, #faf7f2 0%, #f4ede4 100%)', minHeight: '100vh', color: '#2c1810' }}>
        <ServiceWorkerRegister />
        <AlertProvider>
          <main className="container-fluid p-0">
            {children}
          </main>
        </AlertProvider>
      </body>
    </html>
  );
}
