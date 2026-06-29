export function DashboardError({ message }: { message: string }) {
  return (
    <div style={{
      background: "#fff8f8",
      border: "1.5px solid #f5c6c6",
      borderLeft: "4px solid #c62828",
      borderRadius: "10px",
      padding: "18px 22px",
      color: "#c62828",
      fontSize: "14px",
      fontWeight: 500,
    }}>
      Error al obtener métricas: {message}
    </div>
  );
}