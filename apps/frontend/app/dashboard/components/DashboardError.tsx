export function DashboardError({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "#fdecea",
        border: "1.5px solid #f5c6c6",
        borderRadius: "12px",
        padding: "20px 24px",
        color: "#c62828",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      ⚠️ {message}
    </div>
  );
}