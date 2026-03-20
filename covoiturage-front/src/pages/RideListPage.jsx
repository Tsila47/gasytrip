import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api.js";

function RideCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-32 bg-gray-800 rounded-lg" />
        <div className="h-5 w-4 bg-gray-800 rounded" />
        <div className="h-5 w-32 bg-gray-800 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <div className="h-4 w-28 bg-gray-800 rounded" />
        <div className="h-4 w-20 bg-gray-800 rounded" />
        <div className="h-4 w-24 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

function RideCard({ r, index }) {
  return (
    <div
      className="bg-gray-900 border border-gray-800 hover:border-indigo-500/60 rounded-2xl p-6 flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 group"
      style={{
        animationName: "fadeSlideIn",
        animationDuration: "0.4s",
        animationTimingFunction: "ease-out",
        animationFillMode: "both",
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div className="flex-1 min-w-0">
        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white font-bold text-lg truncate">{r.departure_city}</span>
          <span className="text-indigo-400 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
          <span className="text-white font-bold text-lg truncate">{r.arrival_city}</span>
        </div>

        {/* Infos */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 shrink-0">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {new Date(r.departure_datetime).toLocaleString("fr-MG")}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 shrink-0">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {r.driver_name}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 shrink-0">
              <path d="M5 17H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13l4 4v6a2 2 0 0 1-2 2h-2"/>
              <circle cx="8.5" cy="17" r="2.5"/><circle cx="17.5" cy="17" r="2.5"/>
            </svg>
            {r.vehicle_brand} {r.vehicle_model}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
            r.seats_available === 0
              ? "bg-red-500/15 text-red-400"
              : r.seats_available <= 2
              ? "bg-amber-500/15 text-amber-400"
              : "bg-green-500/15 text-green-400"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 shrink-0">
              <path d="M20 9V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/>
              <path d="M20 15v4M20 15H9"/>
            </svg>
            {r.seats_available === 0
              ? "Complet"
              : `${r.seats_available} place${r.seats_available > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Prix + CTA */}
      <div className="text-right shrink-0 flex flex-col items-end gap-3">
        <div>
          <p className="text-indigo-400 font-bold text-2xl leading-none">
            {Number(r.price).toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Ariary / place</p>
        </div>
        <Link
          to={`/rides/${r.id}`}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-200 group-hover:scale-105 inline-block"
        >
          Voir →
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

  const query = useMemo(() => {
    const params = new URLSearchParams();
    for (const key of ["departure_city", "arrival_city", "departure_datetime", "price_max", "seats_min"]) {
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
          {["Prix croissant", "Places dispo", "Plus proche"].map((f) => (
            <button
              key={f}
              type="button"
              className="bg-gray-900 border border-gray-800 hover:border-indigo-500/50 text-gray-400 hover:text-white text-xs px-4 py-2 rounded-full transition-all"
            >
              {f}
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
            {rides.map((r, i) => (
              <RideCard key={r.id} r={r} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}