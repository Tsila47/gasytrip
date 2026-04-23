import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api.js";

function Stars({ rating, size = "sm" }) {
  const stars = [1, 2, 3, 4, 5];
  const sz = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {stars.map(s => (
        <svg key={s} viewBox="0 0 24 24" className={sz}
          fill={s <= Math.round(rating) ? "#f59e0b" : "none"}
          stroke={s <= Math.round(rating) ? "#f59e0b" : "#4b5563"}
          strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, photoUrl }) {
  const initials = name
    ? name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const colors = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-pink-500 to-rose-600",
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  if (photoUrl) {
    return (
      <img src={photoUrl} alt={name}
        className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/30 shadow-lg shrink-0" />
    );
  }
  return (
    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-3xl font-bold text-white shadow-lg shrink-0`}>
      {initials}
    </div>
  );
}

export default function DriverProfilePage() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/rides/driver/${id}`)
      .then(({ data }) => {
        setDriver(data.driver);
        setUpcomingRides(data.upcoming_rides || []);
      })
      .catch(() => setError("Conducteur introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  const memberSince = driver?.member_since
    ? new Date(driver.member_since).toLocaleDateString("fr-MG", { year: "numeric", month: "long" })
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">

        <Link to="/rides" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-6">
          ← Retour aux trajets
        </Link>

        {loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 animate-pulse h-48" />
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!loading && driver && (
          <div className="space-y-4">

            {/* Carte conducteur */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <Avatar name={driver.name} photoUrl={driver.photo_url} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                    <h1 className="text-white font-bold text-2xl">{driver.name}</h1>
                    <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
                      🚗 Conducteur
                    </span>
                  </div>

                  {/* Note */}
                  {driver.avg_rating && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <Stars rating={driver.avg_rating} size="sm" />
                      <span className="text-amber-400 font-bold text-sm">{driver.avg_rating}</span>
                      <span className="text-gray-500 text-xs">({driver.rating_count} avis)</span>
                    </div>
                  )}

                  {memberSince && (
                    <p className="text-gray-500 text-xs">Membre depuis {memberSince}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Trajets publiés",      value: driver.rides_count,      color: "text-indigo-400", icon: "🚗" },
                { label: "Passagers transportés", value: driver.passengers_count, color: "text-emerald-400", icon: "👥" },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Prochains trajets */}
            {upcomingRides.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h2 className="text-white font-semibold">Prochains trajets disponibles</h2>
                </div>
                <div className="divide-y divide-gray-800">
                  {upcomingRides.map(r => (
                    <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-800/40 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{r.departure_city}</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            className="w-3 h-3 text-indigo-400 shrink-0">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                          <span className="text-white font-medium text-sm">{r.arrival_city}</span>
                        </div>
                        <p className="text-gray-500 text-xs">
                          {new Date(r.departure_datetime).toLocaleString("fr-MG")} · {r.seats_available} place{r.seats_available > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-indigo-400 font-bold text-sm">{Number(r.price).toLocaleString()} Ar</p>
                        <Link to={`/rides/${r.id}`}
                          className="text-xs text-gray-400 hover:text-white transition-colors">
                          Voir →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}