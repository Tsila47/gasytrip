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

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl px-6 py-4 max-w-lg w-full text-center shadow-2xl">
          <p className="font-bold text-lg mb-2">Oups!</p>
          <p>{error}</p>
          <Link to="/rides" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 underline">Retour aux trajets</Link>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin direction-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-12 px-4 relative selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <Link to="/rides" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors mb-8 group font-medium text-sm">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Retour aux trajets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Itinerary Card */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border ${
                  ride.status === "OPEN"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${ride.status === "OPEN" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}></span>
                  {ride.status === "OPEN" ? "Ouvert" : "Fermé"}
                </span>
              </div>

              <h1 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-6">Détails du trajet</h1>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
                <div className="flex-1">
                  <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                    {ride.departure_city}
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-center justify-center px-4">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent mb-2"></div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-indigo-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
                <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                </div>
                <div className="flex-1 text-left md:text-right">
                  <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
                    {ride.arrival_city}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-800/50">
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Date de départ</p>
                  <p className="text-white font-semibold">
                    {new Date(ride.departure_datetime).toLocaleDateString("fr-MG", { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-indigo-400 font-bold text-lg mt-1">
                    {new Date(ride.departure_datetime).toLocaleTimeString("fr-MG", { hour: '2-digit', minute:'2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Places Dispo</p>
                  <p className="text-white font-semibold text-lg">
                    {ride.seats_available} <span className="text-gray-500 text-sm">/ {ride.seats_total}</span>
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Prix par place</p>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {Number(ride.price).toLocaleString()} <span className="text-lg text-emerald-500/50">Ar</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Driver & Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl flex items-center gap-4 hover:border-indigo-500/30 transition-colors group">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Conducteur</p>
                  <Link to={`/conducteurs/${ride.driver_id}`} className="text-xl font-bold text-white hover:text-indigo-400 transition-colors">
                    {ride.driver_name}
                  </Link>
                  <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Profil vérifié
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13l4 4v6a2 2 0 0 1-2 2h-2"/><circle cx="8.5" cy="17" r="2.5"/><circle cx="17.5" cy="17" r="2.5"/></svg>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Véhicule</p>
                  <p className="text-lg font-bold text-white leading-tight">{ride.vehicle_brand}</p>
                  <p className="text-sm text-gray-400">{ride.vehicle_model} • <span className="uppercase text-xs">{ride.vehicle_plate}</span></p>
                </div>
              </div>
            </div>

            {/* Description */}
            {ride.description && (
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-indigo-400"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Note du conducteur
                </h3>
                <p className="text-gray-300 leading-relaxed bg-gray-800/30 p-4 rounded-2xl border border-white/5">{ride.description}</p>
              </div>
            )}
          </div>

          {/* Booking Column */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl sticky top-24">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-3xl pointer-events-none"></div>
              
              <h2 className="text-xl font-bold text-white mb-6">Réserver votre place</h2>
              
              {bookError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
                  {bookError}
                </div>
              )}

              {ride.status !== "OPEN" ? (
                <div className="bg-gray-800/50 rounded-2xl p-6 text-center border border-gray-700">
                  <p className="text-gray-400 font-medium">Ce trajet n'est plus disponible.</p>
                </div>
              ) : ride.seats_available === 0 ? (
                <div className="bg-gray-800/50 rounded-2xl p-6 text-center border border-gray-700">
                  <p className="text-gray-400 font-medium">Toutes les places sont réservées.</p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-6 relative z-10">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-gray-300 font-medium text-sm">Places à réserver</label>
                      <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded-md">{ride.seats_available} max</span>
                    </div>
                    <div className="relative">
                      <select
                        value={seatsToBook}
                        onChange={(e) => setSeatsToBook(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-white text-base appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
                      >
                        {[...Array(ride.seats_available)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} place{i > 0 ? 's' : ''}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800/80">
                    <div className="flex justify-between items-end mb-1">
                      <p className="text-gray-400 text-sm">Total</p>
                      <p className="text-3xl font-black text-white">
                        {(Number(seatsToBook) * Number(ride.price)).toLocaleString()} <span className="text-base text-gray-500 font-bold">Ar</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={booking || !user}
                    className="w-full relative group overflow-hidden bg-white rounded-xl font-bold text-gray-900 px-6 py-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors">
                      {!user ? "Connectez-vous pour réserver" : booking ? "Réservation en cours..." : "Confirmer la réservation"}
                      {user && !booking && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>}
                    </span>
                  </button>
                  
                  {!user && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Pas encore de compte ? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">S'inscrire</Link>
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}