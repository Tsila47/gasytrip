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

        {!loading && upcomingBookings.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wider">Trajets à venir</h2>
            <div className="space-y-4 mb-8">
              {upcomingBookings.map((b) => (
                <div key={b.id} className="bg-gray-900 border border-indigo-500/30 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-white font-bold">{b.departure_city}</span>
                        <span className="text-indigo-400">→</span>
                        <span className="text-white font-bold">{b.arrival_city}</span>
                        <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {getDaysLeftLabel(b.departure_datetime)}
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
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Prix total</p>
                          <p className="text-indigo-400 font-semibold">{(Number(b.price) * Number(b.seats_booked)).toLocaleString()} Ar</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Conducteur</p>
                          <p className="text-gray-300">{b.driver_name}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCancel(b.id)}
                      className="shrink-0 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && pastOrCancelledBookings.length > 0 && (
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Historique</h2>
        )}

        <div className="space-y-4">
          {pastOrCancelledBookings.map((b) => (
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
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Prix total</p>
                      <p className="text-indigo-400 font-semibold">{(Number(b.price)*Number(b.seats_booked)).toLocaleString()} Ar</p>
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

              {(() => {
                const isPastRide = new Date(b.departure_datetime).getTime() <= Date.now();
                const canRate = b.status === "CONFIRMED" && isPastRide && b.my_rating === null;
                if (!canRate && b.my_rating === null) return null;

                return (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    {b.my_rating !== null ? (
                      <div className="text-sm">
                        <p className="text-gray-400">
                          Ta note: <span className="text-amber-400 font-semibold">{b.my_rating} ⭐</span>
                        </p>
                        {b.my_rating_created_at && (
                          <p className="text-gray-600 text-xs mt-0.5">
                            Noté le {new Date(b.my_rating_created_at).toLocaleDateString("fr-MG")}
                          </p>
                        )}
                        {b.my_rating_comment && (
                          <p className="text-gray-500 text-xs mt-1">{b.my_rating_comment}</p>
                        )}
                        {editingRatingId !== b.id && (
                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => startEditRating(b)}
                              className="text-xs text-indigo-300 border border-indigo-500/40 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRating(b)}
                              disabled={ratingActionKey === `${b.id}:delete`}
                              className="text-xs text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                            >
                              {ratingActionKey === `${b.id}:delete` ? "Suppression..." : "Supprimer"}
                            </button>
                          </div>
                        )}
                        {editingRatingId === b.id && (
                          <div className="space-y-3 mt-3">
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => updateRatingForm(b.id, { rating: value })}
                                  className={`text-lg ${
                                    (ratingForms[b.id]?.rating ?? Number(b.my_rating) ?? 5) >= value
                                      ? "text-amber-400"
                                      : "text-gray-600"
                                  }`}
                                  aria-label={`Donner ${value} étoile${value > 1 ? "s" : ""}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <textarea
                              rows={2}
                              value={ratingForms[b.id]?.comment ?? b.my_rating_comment ?? ""}
                              onChange={(e) => updateRatingForm(b.id, { comment: e.target.value })}
                              placeholder="Commentaire optionnel..."
                              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateRating(b)}
                                disabled={ratingActionKey === `${b.id}:update`}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                              >
                                {ratingActionKey === `${b.id}:update` ? "Mise à jour..." : "Enregistrer"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingRatingId(null)}
                                className="border border-gray-600 text-gray-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-300">
                          Note le conducteur <span className="text-indigo-400 font-semibold">{b.driver_name}</span>
                        </p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => updateRatingForm(b.id, { rating: value })}
                              className={`text-lg ${
                                (ratingForms[b.id]?.rating ?? 5) >= value ? "text-amber-400" : "text-gray-600"
                              }`}
                              aria-label={`Donner ${value} étoile${value > 1 ? "s" : ""}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={2}
                          value={ratingForms[b.id]?.comment ?? ""}
                          onChange={(e) => updateRatingForm(b.id, { comment: e.target.value })}
                          placeholder="Commentaire optionnel..."
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSubmitRating(b)}
                          disabled={submittingRatingId === b.id}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                        >
                          {submittingRatingId === b.id ? "Envoi..." : "Envoyer ma note"}
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
          <p className="text-gray-500 text-sm">Aucun trajet passé pour le moment.</p>
        )}
      </div>
    </div>
  );
}