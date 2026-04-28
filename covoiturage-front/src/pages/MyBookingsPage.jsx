import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function getDaysLeftLabel(departureDatetime) {
  const now = Date.now();
  const departure = new Date(departureDatetime).getTime();
  const diffMs = departure - now;
  if (diffMs <= 0) return "Trajet passé";
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  return `J-${days}`;
}

function isUpcomingBooking(booking) {
  return booking.status === "CONFIRMED" && new Date(booking.departure_datetime).getTime() > Date.now();
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ratingForms, setRatingForms] = useState({});
  const [submittingRatingId, setSubmittingRatingId] = useState(null);
  const [editingRatingId, setEditingRatingId] = useState(null);
  const [ratingActionKey, setRatingActionKey] = useState(null);

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

  function updateRatingForm(bookingId, patch) {
    setRatingForms((prev) => ({
      ...prev,
      [bookingId]: {
        rating: prev[bookingId]?.rating ?? 5,
        comment: prev[bookingId]?.comment ?? "",
        ...patch,
      },
    }));
  }

  async function handleSubmitRating(booking) {
    const current = ratingForms[booking.id] || { rating: 5, comment: "" };
    const ratingValue = Number(current.rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setError("Choisis une note entre 1 et 5.");
      return;
    }

    setSubmittingRatingId(booking.id);
    setError("");
    try {
      await api.post(`/rides/${booking.ride_id}/rating`, {
        rating: ratingValue,
        comment: current.comment?.trim() || null,
      });
      await loadBookings();
      setRatingForms((prev) => {
        const next = { ...prev };
        delete next[booking.id];
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'enregistrer la note.");
    } finally {
      setSubmittingRatingId(null);
    }
  }

  function startEditRating(booking) {
    updateRatingForm(booking.id, {
      rating: Number(booking.my_rating) || 5,
      comment: booking.my_rating_comment || "",
    });
    setEditingRatingId(booking.id);
  }

  async function handleUpdateRating(booking) {
    const current = ratingForms[booking.id] || {
      rating: Number(booking.my_rating) || 5,
      comment: booking.my_rating_comment || "",
    };
    const ratingValue = Number(current.rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setError("Choisis une note entre 1 et 5.");
      return;
    }

    const key = `${booking.id}:update`;
    setRatingActionKey(key);
    setError("");
    try {
      await api.put(`/rides/${booking.ride_id}/rating`, {
        rating: ratingValue,
        comment: current.comment?.trim() || null,
      });
      await loadBookings();
      setEditingRatingId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de mettre à jour la note.");
    } finally {
      setRatingActionKey(null);
    }
  }

  async function handleDeleteRating(booking) {
    if (!window.confirm("Supprimer ta note pour ce trajet ?")) return;
    const key = `${booking.id}:delete`;
    setRatingActionKey(key);
    setError("");
    try {
      await api.delete(`/rides/${booking.ride_id}/rating`);
      await loadBookings();
      setEditingRatingId(null);
      setRatingForms((prev) => {
        const next = { ...prev };
        delete next[booking.id];
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de supprimer la note.");
    } finally {
      setRatingActionKey(null);
    }
  }

  const upcomingBookings = bookings.filter(isUpcomingBooking);
  const pastOrCancelledBookings = bookings.filter((booking) => !isUpcomingBooking(booking));

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-12 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Réservations</span>
            </h1>
            <p className="text-gray-400 font-medium">
              Suivez vos trajets en tant que passager ({bookings.length} réservation{bookings.length !== 1 ? "s" : ""})
            </p>
          </div>
          <Link
            to="/rides"
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all border border-gray-700 flex items-center gap-2 group"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Rechercher un trajet
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl px-6 py-4 mb-8 shadow-xl">
            <span className="font-bold">Erreur :</span> {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 animate-pulse h-32" />
            ))}
          </div>
        )}

        {!loading && bookings.length === 0 && !error && (
          <div className="text-center py-20 bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl">
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-[-5deg]">
              <span className="text-4xl">🎫</span>
            </div>
            <p className="text-white text-xl font-bold mb-2">Aucune réservation pour le moment</p>
            <p className="text-gray-400 mb-6">Trouvez un trajet qui correspond à vos besoins.</p>
            <Link to="/rides" className="inline-block bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25">
              Explorer les trajets
            </Link>
          </div>
        )}

        {!loading && upcomingBookings.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-white">Trajets à venir</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
            </div>
            <div className="space-y-6 mb-12">
              {upcomingBookings.map((b) => (
                <div key={b.id} className="bg-gray-900/60 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-indigo-500/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="text-white font-bold text-xl">{b.departure_city}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-indigo-400"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                        <span className="text-white font-bold text-xl">{b.arrival_city}</span>
                        <span className="md:ml-4 text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {getDaysLeftLabel(b.departure_datetime)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-gray-800/40 rounded-2xl p-3 border border-white/5">
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Date</p>
                          <p className="text-gray-300 font-medium">{new Date(b.departure_datetime).toLocaleDateString("fr-MG", { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                        </div>
                        <div className="bg-gray-800/40 rounded-2xl p-3 border border-white/5">
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Places réservées</p>
                          <p className="text-gray-300 font-bold">{b.seats_booked} passager(s)</p>
                        </div>
                        <div className="bg-gray-800/40 rounded-2xl p-3 border border-white/5">
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Prix total</p>
                          <p className="text-indigo-400 font-black text-lg">{(Number(b.price) * Number(b.seats_booked)).toLocaleString()} <span className="text-xs text-gray-500 font-bold">Ar</span></p>
                        </div>
                        <div className="bg-gray-800/40 rounded-2xl p-3 border border-white/5">
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Conducteur</p>
                          <p className="text-gray-300 font-bold">{b.driver_name}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCancel(b.id)}
                      className="shrink-0 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
                    >
                      Annuler la réservation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && pastOrCancelledBookings.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-6 mt-8">
              <h2 className="text-xl font-bold text-gray-300">Historique</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>
            </div>
          </>
        )}

        <div className="space-y-6 opacity-90 hover:opacity-100 transition-opacity">
          {pastOrCancelledBookings.map((b) => (
            <div key={b.id} className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="text-white font-bold">{b.departure_city}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                    <span className="text-white font-bold">{b.arrival_city}</span>
                    <span className={`md:ml-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      b.status === "CONFIRMED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}>
                      {b.status === "CONFIRMED" ? "Confirmée" : "Annulée"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-800/30 rounded-xl p-3">
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Date</p>
                      <p className="text-gray-400">{new Date(b.departure_datetime).toLocaleDateString("fr-MG")}</p>
                    </div>
                    <div className="bg-gray-800/30 rounded-xl p-3">
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Places</p>
                      <p className="text-gray-400">{b.seats_booked}</p>
                    </div>
                    <div className="bg-gray-800/30 rounded-xl p-3">
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Prix total</p>
                      <p className="text-gray-400 font-semibold">{(Number(b.price)*Number(b.seats_booked)).toLocaleString()} Ar</p>
                    </div>
                    <div className="bg-gray-800/30 rounded-xl p-3">
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Conducteur</p>
                      <p className="text-gray-400">{b.driver_name}</p>
                    </div>
                  </div>
                </div>
                {b.status !== "CANCELLED" && (
                  <button
                    type="button"
                    onClick={() => handleCancel(b.id)}
                    className="shrink-0 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>

              {(() => {
                const isPastRide = new Date(b.departure_datetime).getTime() <= Date.now();
                const canRate = b.status === "CONFIRMED" && isPastRide && b.my_rating === null;
                if (!canRate && b.my_rating === null) return null;

                return (
                  <div className="mt-6 pt-6 border-t border-gray-800/50">
                    {b.my_rating !== null ? (
                      <div className="text-sm bg-gray-800/20 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-gray-400 font-medium">
                            Votre note : <span className="text-amber-400 font-bold ml-1">{b.my_rating} ⭐</span>
                          </p>
                          {b.my_rating_created_at && (
                            <p className="text-gray-600 text-[10px] uppercase tracking-wider">
                              {new Date(b.my_rating_created_at).toLocaleDateString("fr-MG")}
                            </p>
                          )}
                        </div>
                        
                        {b.my_rating_comment && (
                          <p className="text-gray-300 italic mb-4">"{b.my_rating_comment}"</p>
                        )}
                        
                        {editingRatingId !== b.id && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditRating(b)}
                              className="text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-xl transition-colors"
                            >
                              Modifier l'avis
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRating(b)}
                              disabled={ratingActionKey === `${b.id}:delete`}
                              className="text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                            >
                              {ratingActionKey === `${b.id}:delete` ? "Suppression..." : "Supprimer"}
                            </button>
                          </div>
                        )}
                        {editingRatingId === b.id && (
                          <div className="space-y-4 mt-4 bg-gray-900 rounded-2xl p-4 border border-gray-800">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => updateRatingForm(b.id, { rating: value })}
                                  className={`text-2xl hover:scale-110 transition-transform ${
                                    (ratingForms[b.id]?.rating ?? Number(b.my_rating) ?? 5) >= value
                                      ? "text-amber-400"
                                      : "text-gray-700"
                                  }`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <textarea
                              rows={2}
                              value={ratingForms[b.id]?.comment ?? b.my_rating_comment ?? ""}
                              onChange={(e) => updateRatingForm(b.id, { comment: e.target.value })}
                              placeholder="Partagez votre expérience avec ce conducteur..."
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateRating(b)}
                                disabled={ratingActionKey === `${b.id}:update`}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
                              >
                                {ratingActionKey === `${b.id}:update` ? "Enregistrement..." : "Sauvegarder"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingRatingId(null)}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5">
                        <p className="text-sm font-bold text-white mb-3">
                          Comment s'est passé votre trajet avec <span className="text-indigo-400">{b.driver_name}</span> ?
                        </p>
                        <div className="flex gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => updateRatingForm(b.id, { rating: value })}
                              className={`text-2xl hover:scale-110 transition-transform ${
                                (ratingForms[b.id]?.rating ?? 5) >= value ? "text-amber-400" : "text-gray-700"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={2}
                          value={ratingForms[b.id]?.comment ?? ""}
                          onChange={(e) => updateRatingForm(b.id, { comment: e.target.value })}
                          placeholder="Laissez un commentaire optionnel..."
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors mb-3"
                        />
                        <button
                          type="button"
                          onClick={() => handleSubmitRating(b)}
                          disabled={submittingRatingId === b.id}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
                        >
                          {submittingRatingId === b.id ? "Envoi en cours..." : "Publier l'avis"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>

        {!loading && bookings.length > 0 && pastOrCancelledBookings.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">Aucun trajet passé pour le moment.</p>
        )}
      </div>
    </div>
  );
}