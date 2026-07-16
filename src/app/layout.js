import './globals.css';

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

        {/* Bootstrap JS */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          defer
        ></script>
      </head>

      <body style={{ backgroundColor: '#f8f9fa' }}>
        <main className="container-fluid p-0">
          {children}
        </main>
      </body>
    </html>
  );
}
