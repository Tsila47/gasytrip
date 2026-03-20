import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/rides/me/bookings");
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de récupérer les réservations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookings(); }, []);

  async function handleCancel(bookingId) {
    if (!window.confirm("Annuler cette réservation ?")) return;
    try {
      await api.delete(`/rides/bookings/${bookingId}`);
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'annuler.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Mes réservations</h1>
        <p className="text-gray-400 text-sm mb-8">{bookings.length} réservation{bookings.length !== 1 ? "s" : ""}</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse h-28" />
            ))}
          </div>
        )}

        {!loading && bookings.length === 0 && !error && (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🎫</span>
            <p className="text-gray-400">Aucune réservation pour le moment.</p>
            <Link to="/rides" className="text-indigo-400 hover:text-indigo-300 text-sm mt-3 inline-block">
              Trouver un trajet
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white font-bold">{b.departure_city}</span>
                    <span className="text-indigo-400">→</span>
                    <span className="text-white font-bold">{b.arrival_city}</span>
                    <span className={`ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      b.status === "CONFIRMED"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-gray-700 text-gray-400 border border-gray-600"
                    }`}>
                      {b.status === "CONFIRMED" ? "Confirmée" : "Annulée"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Date</p>
                      <p className="text-gray-300">{new Date(b.departure_datetime).toLocaleDateString("fr-MG")}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Places</p>
                      <p className="text-gray-300">{b.seats_booked}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Prix</p>
                      <p className="text-indigo-400 font-semibold">{Number(b.price).toLocaleString()} Ar</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Conducteur</p>
                      <p className="text-gray-300">{b.driver_name}</p>
                    </div>
                  </div>
                </div>
                {b.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => handleCancel(b.id)}
                    className="shrink-0 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}