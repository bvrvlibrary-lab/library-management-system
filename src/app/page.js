export default function HomePage() {
  return (
    <div className="text-center py-5">
      <div className="p-5 mb-4 bg-white rounded-3 shadow-sm border">
        <h1 className="display-5 fw-bold text-dark">Library Management System</h1>
        <p className="col-md-8 fs-4 mx-auto text-muted mt-3">
          Welcome to the digital catalog portal. Explore our physical assets list or use the admin gateway panel to manage items.
        </p>
        <hr className="my-4" />
        <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
          <a href="/database" className="btn btn-primary btn-lg px-4 gap-3">
            Browse Physical Books
          </a>
          <a href="/admin/dashboard" className="btn btn-outline-secondary btn-lg px-4">
            Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
