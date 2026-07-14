export default function LoadingSpinner({
  text = "Loading..."
}) {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "70vh"
      }}
    >
      <div className="text-center">

        <div
          className="spinner-border text-warning"
          style={{
            width: "3rem",
            height: "3rem"
          }}
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <h5 className="mt-3 fw-bold text-secondary">
          {text}
        </h5>

      </div>
    </div>
  );
}
