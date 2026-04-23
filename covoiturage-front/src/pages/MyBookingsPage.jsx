import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function Stars({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="focus:outline-none disabled:cursor-default"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 transition-colors"
            fill={(hovered || value) >= s ? "#f59e0b" : "none"}
            stroke={(hovered || value) >= s ? "#f59e0b" : "#4b5563"}
            strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

function RatingModal({ booking, onClose, onSaved }) {
  const [rating, setRating] = useState(booking.my_rating || 0);
  const [comment, setComment] = useState(booking.my_rating_comment || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!booking.my_rating;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) { setError("Choisis une note."); return; }
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/rides/${booking.ride_id}/rating`, { rating, comment });
      } else {
        await api.post(`/rides/${booking.ride_id}/rating`, { rating, comment });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Supprimer ta note ?")) return;
    setSaving(true);
    try {
      await api.delete(`/rides/${booking.ride_id}/rating`);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">
            {isEdit ? "Modifier ta note" : "Noter ce trajet"}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          {booking.departure_city} → {booking.arrival_city} · {booking.driver_name}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
              Ta note
            </label>
            <Stars value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">
              Commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Bon conducteur, trajet agréable..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Envoyer la note"}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-3 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
              >
                Supprimer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ratingBooking, setRatingBooking] = useState(null);

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

  function canRate(b) {
    if (b.status !== "CONFIRMED") return false;
    return new Date(b.departure_datetime).getTime() < Date.now();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Mes réservations</h1>
        <p className="text-gray-400 text-sm mb-8">
          {bookings.length} réservation{bookings.length !== 1 ? "s" : ""}
        </p>

        {loading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse h-28" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
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
          {bookings.map(b => (
            <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-white font-bold">{b.departure_city}</span>
                    <span className="text-indigo-400">→</span>
                    <span className="text-white font-bold">{b.arrival_city}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
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
                      <p className="text-gray-300 text-xs">{new Date(b.departure_datetime).toLocaleString("fr-MG")}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Places</p>
                      <p className="text-gray-300">{b.seats_booked}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Prix total</p>
                      <p className="text-indigo-400 font-semibold">
                        {(Number(b.price) * Number(b.seats_booked)).toLocaleString()} Ar
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Conducteur</p>
                      <Link
                        to={`/conducteurs/${b.driver_id}`}
                        className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                      >
                        {b.driver_name} →
                      </Link>
                    </div>
                  </div>
                </div>

                {b.status !== "CANCELLED" && new Date(b.departure_datetime).getTime() > Date.now() && (
                  <button
                    type="button"
                    onClick={() => handleCancel(b.id)}
                    className="shrink-0 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>

              {/* Notation */}
              {canRate(b) && (
                <div className="pt-4 border-t border-gray-800">
                  {b.my_rating ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} viewBox="0 0 24 24" className="w-4 h-4"
                              fill={s <= b.my_rating ? "#f59e0b" : "none"}
                              stroke={s <= b.my_rating ? "#f59e0b" : "#4b5563"}
                              strokeWidth="1.5">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-400 text-xs">
                          {b.my_rating_comment || "Aucun commentaire"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRatingBooking(b)}
                        className="text-gray-400 hover:text-white text-xs border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Modifier
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRatingBooking(b)}
                      className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Noter ce trajet
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {ratingBooking && (
        <RatingModal
          booking={ratingBooking}
          onClose={() => setRatingBooking(null)}
          onSaved={loadBookings}
        />
      )}
    </div>
  );
}