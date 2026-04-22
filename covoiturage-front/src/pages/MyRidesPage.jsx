import { useEffect, useState } from "react";

export default function MyRidesPage() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const token = localStorage.getItem("token");

  const [rides, setRides] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setError("");

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/rides/me/rides`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data.message || "Impossible de charger tes trajets.");
          return;
        }

        setRides(data.rides || []);
      } catch {
        setError("Impossible de contacter le backend.");
      }
    })();
  }, [token, API_URL]);

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Mes trajets (conducteur)</h1>
      {!token && <p>Connecte-toi pour voir tes trajets.</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {token && !error && (
        <section style={{ marginTop: "1.5rem" }}>
          {rides.length === 0 ? (
            <p>Aucun trajet pour le moment.</p>
          ) : (
            <ul style={{ paddingLeft: "1.2rem" }}>
              {rides.map((r) => (
                <li key={r.id} style={{ marginBottom: "1rem" }}>
                  <strong>
                    {r.departure_city} → {r.arrival_city}
                  </strong>
                  <div>Date: {new Date(r.departure_datetime).toLocaleString()}</div>
                  <div>Prix: {r.price} Ariary</div>
                  <div>Places: {r.seats_available} / {r.seats_total}</div>
                  <div>Statut: {r.status}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}