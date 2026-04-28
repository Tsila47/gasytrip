import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";

function Avatar({ name, photoUrl }) {
  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-28 h-28 rounded-full object-cover shadow-2xl border-4 border-indigo-500/30 shrink-0"
      />
    );
  }

  return (
    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 border-4 border-white/10 text-white flex items-center justify-center text-4xl font-black shadow-2xl shrink-0">
      {initials}
    </div>
  );
}

function getDriverBadges(stats) {
  const ridesCount = Number(stats?.rides_count) || 0;
  const ratingsCount = Number(stats?.ratings_count) || 0;
  const averageRating = stats?.average_rating !== null ? Number(stats?.average_rating) : null;
  const badges = [];

  if (ridesCount < 3) {
    badges.push({
      key: "new",
      label: "Nouveau conducteur",
      className: "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    });
  }

  if (ridesCount >= 3) {
    badges.push({
      key: "regular",
      label: "Conducteur régulier",
      className: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
    });
  }

  if (ridesCount >= 10 && ratingsCount >= 5 && averageRating !== null && averageRating >= 4.5) {
    badges.push({
      key: "top",
      label: "Top conducteur",
      className: "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
    });
  }

  return badges;
}

export default function DriverProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    api
      .get(`/users/${id}/public`)
      .then(({ data }) => {
        if (mounted) {
          setProfile(data);
          setError("");
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.response?.data?.message || "Profil conducteur introuvable.");
          setProfile(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const badges = profile ? getDriverBadges(profile.stats) : [];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-12 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Link to="/rides" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors mb-8 group font-medium text-sm">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Retour aux trajets
        </Link>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl px-6 py-4 mb-8 shadow-2xl text-center">
            <span className="font-bold">Oups!</span> {error}
          </div>
        )}

        {!profile && !error && (
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-8 animate-pulse h-64" />
        )}

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Driver Main Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 opacity-50"></div>
                
                <div className="relative mx-auto w-fit mb-6 mt-4">
                  <Avatar name={profile.user.name} photoUrl={profile.user.photo_url} />
                  {profile.user.is_driver && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0a0f1c] rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center text-lg shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                        🚗
                      </div>
                    </div>
                  )}
                </div>

                <h1 className="text-white font-bold text-2xl tracking-tight relative z-10 mb-3">{profile.user.name}</h1>
                
                <div className="flex flex-col items-center gap-2 relative z-10">
                  {badges.map((badge) => (
                    <span
                      key={badge.key}
                      className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>

                {profile.user.member_since && (
                  <div className="mt-8 pt-6 border-t border-gray-800/50 relative z-10">
                    <p className="text-gray-400 text-sm">Membre depuis</p>
                    <p className="text-white font-medium">
                      {new Date(profile.user.member_since).toLocaleDateString("fr-MG", {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Stats & Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full opacity-50"></div>
                  <p className="text-4xl font-black text-indigo-400 mb-2">{profile.stats.rides_count}</p>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider leading-tight">Trajets publiés</p>
                </div>
                <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full opacity-50"></div>
                  <p className="text-4xl font-black text-emerald-400 mb-2">{profile.stats.passengers_count}</p>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider leading-tight">Passagers transportés</p>
                </div>
                <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full opacity-50"></div>
                  <p className="text-4xl font-black text-amber-400 mb-2">
                    {profile.stats.average_rating !== null ? `${profile.stats.average_rating.toFixed(1)}` : "-"}
                    <span className="text-2xl opacity-70 ml-1">⭐</span>
                  </p>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider leading-tight">
                    {profile.stats.ratings_count > 0 ? `${profile.stats.ratings_count} avis` : "Note moyenne"}
                  </p>
                </div>
              </div>

              {/* Derniers Trajets */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-indigo-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                    Derniers trajets
                  </h2>
                  <Link
                    to={`/rides?driver_id=${profile.user.id}`}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-full transition-colors"
                  >
                    Voir tout
                  </Link>
                </div>

                {profile.recent_rides?.length > 0 ? (
                  <div className="space-y-4">
                    {profile.recent_rides.map((ride) => (
                      <Link
                        key={ride.id}
                        to={`/rides/${ride.id}`}
                        className="block bg-gray-800/40 hover:bg-gray-800/80 border border-white/5 hover:border-indigo-500/30 rounded-2xl px-6 py-5 transition-all duration-300 hover:-translate-y-1 group"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div>
                            <p className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                              {ride.departure_city}
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-indigo-400"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                              {ride.arrival_city}
                            </p>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>
                              {new Date(ride.departure_datetime).toLocaleString("fr-MG", { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                            </p>
                          </div>
                          <div className="text-left md:text-right w-full md:w-auto">
                            <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-black text-2xl">
                              {Number(ride.price).toLocaleString()} <span className="text-sm font-bold text-gray-500 uppercase">Ar</span>
                            </p>
                            <p className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                              ride.seats_available === 0 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {ride.seats_available}/{ride.seats_total} places
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-800/20 rounded-2xl border border-white/5">
                    <p className="text-gray-400 font-medium">Aucun trajet publié pour le moment.</p>
                  </div>
                )}
              </div>

              {/* Avis Récents */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-amber-400"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                    Avis passagers
                  </h2>
                </div>

                {profile.recent_reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {profile.recent_reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-800/40 border border-white/5 rounded-2xl p-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs">
                              {review.passenger_name.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-bold text-white">{review.passenger_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400" : "text-gray-700"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                              ))}
                            </div>
                            <p className="text-gray-500 text-xs">
                              {new Date(review.created_at).toLocaleDateString("fr-MG")}
                            </p>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-300 text-sm leading-relaxed bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                            "{review.comment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-800/20 rounded-2xl border border-white/5">
                    <p className="text-gray-400 font-medium">Pas encore d'avis publiés.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
