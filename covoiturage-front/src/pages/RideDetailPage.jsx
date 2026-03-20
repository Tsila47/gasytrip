import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function RideDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [error, setError] = useState("");
  const [bookError, setBookError] = useState("");
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    setError("");
    api.get(`/rides/${id}`)
      .then(({ data }) => setRide(data.ride))
      .catch((err) => setError(err.response?.data?.message || "Trajet introuvable."));
  }, [id]);

  async function handleBooking(e) {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setBooking(true);
    setBookError("");
    try {
      await api.post(`/rides/${id}/bookings`, { seats_booked: Number(seatsToBook) });
      navigate("/me/reservations");
    } catch (err) {
      setBookError(err.response?.data?.message || "Impossible de réserver.");
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/rides" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-6">
          ← Retour aux trajets
        </Link>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {!ride && !error && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 animate-pulse h-64" />
        )}

        {ride && (
          <div className="space-y-4">
            {/* Header trajet */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-white font-bold text-2xl">{ride.departure_city}</span>
                <span className="text-indigo-400 text-xl">→</span>
                <span className="text-white font-bold text-2xl">{ride.arrival_city}</span>
                <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${
                  ride.status === "OPEN"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}>
                  {ride.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Date de départ", value: new Date(ride.departure_datetime).toLocaleString("fr-MG") },
                  { label: "Prix", value: `${Number(ride.price).toLocaleString()} Ariary` },
                  { label: "Places disponibles", value: `${ride.seats_available} / ${ride.seats_total}` },
                  { label: "Conducteur", value: ride.driver_name },
                  { label: "Véhicule", value: `${ride.vehicle_brand} ${ride.vehicle_model}` },
                  { label: "Immatriculation", value: ride.vehicle_plate },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-white font-medium">{value}</p>
                  </div>
                ))}
              </div>
              {ride.description && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Description</p>
                  <p className="text-gray-300 text-sm">{ride.description}</p>
                </div>
              )}
            </div>

            {/* Formulaire réservation */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Réserver ce trajet</h2>
              {bookError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                  {bookError}
                </div>
              )}
              {ride.status !== "OPEN" ? (
                <p className="text-gray-400 text-sm">Ce trajet n'est plus disponible.</p>
              ) : ride.seats_available === 0 ? (
                <p className="text-gray-400 text-sm">Plus de places disponibles.</p>
              ) : (
                <form onSubmit={handleBooking} className="flex items-end gap-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">
                      Nombre de places
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={ride.seats_available}
                      value={seatsToBook}
                      onChange={(e) => setSeatsToBook(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm w-32 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-xs mb-1.5">Total estimé</p>
                    <p className="text-indigo-400 font-bold text-lg">
                      {(Number(seatsToBook) * Number(ride.price)).toLocaleString()} Ar
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={booking || !user}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
                  >
                    {!user ? "Connecte-toi" : booking ? "Réservation..." : "Confirmer"}
                  </button>
                </form>
              )}
              {!user && (
                <p className="text-gray-500 text-xs mt-3">
                  <Link to="/login" className="text-indigo-400 hover:underline">Connecte-toi</Link> pour réserver.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}