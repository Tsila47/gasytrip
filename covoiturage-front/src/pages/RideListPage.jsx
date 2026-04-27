import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api.js";

function RideCardSkeleton() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 animate-pulse shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-32 bg-gray-800/80 rounded-lg" />
            <div className="h-5 w-5 bg-gray-800/80 rounded-full" />
            <div className="h-6 w-32 bg-gray-800/80 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <div className="h-6 w-28 bg-gray-800/80 rounded-full" />
            <div className="h-6 w-24 bg-gray-800/80 rounded-full" />
            <div className="h-6 w-32 bg-gray-800/80 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="h-8 w-24 bg-gray-800/80 rounded-lg" />
          <div className="h-10 w-24 bg-gray-800/80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function RideCard({ r, index }) {
  return (
    <div
      className="relative bg-gray-900/60 backdrop-blur-xl border border-white/5 hover:border-indigo-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-indigo-500/10 group overflow-hidden"
      style={{
        animationName: "fadeSlideIn",
        animationDuration: "0.5s",
        animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        animationFillMode: "both",
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

      <div className="flex-1 min-w-0 w-full relative z-10">
        {/* Route */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-white font-extrabold text-xl md:text-2xl tracking-tight truncate">{r.departure_city}</span>
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
          <span className="text-white font-extrabold text-xl md:text-2xl tracking-tight truncate">{r.arrival_city}</span>
        </div>

        {/* Infos Badges */}
        <div className="flex flex-wrap gap-2.5">
          <span className="inline-flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm border border-white/5 text-gray-300 text-xs px-3.5 py-2 rounded-full font-medium">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-indigo-400">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {new Date(r.departure_datetime).toLocaleString("fr-MG", { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
          </span>
          <span className="inline-flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm border border-white/5 text-gray-300 text-xs px-3.5 py-2 rounded-full font-medium">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-cyan-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {r.driver_name}
          </span>
          <span className="inline-flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm border border-white/5 text-gray-300 text-xs px-3.5 py-2 rounded-full font-medium">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-purple-400">
              <path d="M5 17H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13l4 4v6a2 2 0 0 1-2 2h-2"/>
              <circle cx="8.5" cy="17" r="2.5"/><circle cx="17.5" cy="17" r="2.5"/>
            </svg>
            {r.vehicle_brand} {r.vehicle_model}
          </span>
          <span className={`inline-flex items-center gap-2 text-xs px-3.5 py-2 rounded-full font-bold border ${
            r.seats_available === 0
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : r.seats_available <= 2
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M20 9V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/>
              <path d="M20 15v4M20 15H9"/>
            </svg>
            {r.seats_available === 0
              ? "Complet"
              : `${r.seats_available} place${r.seats_available > 1 ? "s" : ""} dispo`}
          </span>
        </div>
      </div>

      {/* Prix + CTA */}
      <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-4 relative z-10 shrink-0">
        <div className="text-left md:text-right">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-black text-3xl md:text-4xl leading-none">
            {Number(r.price).toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-wider">Ariary / place</p>
        </div>
        <Link
          to={`/rides/${r.id}`}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold px-8 py-3 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 hover:scale-[1.05]"
        >
          Réserver
        </Link>
      </div>
    </div>
  );
}

export default function RideListPage() {
  const [searchParams] = useSearchParams();
  const [rides, setRides] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSort, setActiveSort] = useState("closest");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    for (const key of ["departure_city", "arrival_city", "departure_datetime", "price_max", "seats_min", "driver_id"]) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    return params;
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get(`/rides?${query.toString()}`)
      .then(({ data }) => setRides(data.rides || []))
      .catch((err) => setError(err.response?.data?.message || "Erreur lors du chargement."))
      .finally(() => setLoading(false));
  }, [query]);

  const from = searchParams.get("departure_city");
  const to = searchParams.get("arrival_city");
  const sortedRides = useMemo(() => {
    const copy = [...rides];
    if (activeSort === "price_asc") {
      copy.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (activeSort === "seats_desc") {
      copy.sort((a, b) => Number(b.seats_available) - Number(a.seats_available));
    } else {
      copy.sort(
        (a, b) =>
          new Date(a.departure_datetime).getTime() - new Date(b.departure_datetime).getTime()
      );
    }
    return copy;
  }, [rides, activeSort]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          {from && to ? (
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{from}</h1>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-400">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <h1 className="text-2xl font-bold text-white">{to}</h1>
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-white mb-1">Tous les trajets</h1>
          )}
          <p className="text-gray-400 text-sm">
            {loading
              ? "Recherche en cours..."
              : `${rides.length} trajet${rides.length !== 1 ? "s" : ""} trouvé${rides.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Filtres rapides */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "price_asc", label: "Prix croissant" },
            { key: "seats_desc", label: "Places dispo" },
            { key: "closest", label: "Plus proche" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveSort(f.key)}
              className={`text-xs px-4 py-2 rounded-full transition-all border ${
                activeSort === f.key
                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                  : "bg-gray-900 border-gray-800 hover:border-indigo-500/50 text-gray-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
          <Link
            to="/"
            className="bg-gray-900 border border-gray-700 text-indigo-400 hover:text-indigo-300 text-xs px-4 py-2 rounded-full transition-all ml-auto"
          >
            ← Modifier la recherche
          </Link>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <RideCardSkeleton key={i} />)}
          </div>
        )}

        {/* Vide */}
        {!loading && !error && rides.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gray-600">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-gray-400 font-medium mb-1">Aucun trajet trouvé</p>
            <p className="text-gray-600 text-sm mb-6">Essaie d'autres dates ou destinations</p>
            <Link
              to="/"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors inline-block"
            >
              Nouvelle recherche
            </Link>
          </div>
        )}

        {/* Liste */}
        {!loading && (
          <div className="space-y-4">
            {sortedRides.map((r, i) => (
              <RideCard key={r.id} r={r} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}