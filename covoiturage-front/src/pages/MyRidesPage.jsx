import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const STATUS_CONFIG = {
  OPEN:      { label: "Ouvert",   cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  CANCELLED: { label: "Annulé",   cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  COMPLETED: { label: "Terminé",  cls: "bg-gray-700/60 text-gray-400 border-gray-600" },
};

function SkeletonCard() {
  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-28 bg-gray-800 rounded-lg" />
        <div className="h-5 w-4 bg-gray-800 rounded" />
        <div className="h-5 w-28 bg-gray-800 rounded-lg" />
        <div className="h-5 w-16 bg-gray-800 rounded-full ml-auto" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i}>
            <div className="h-3 w-16 bg-gray-800 rounded mb-1.5" />
            <div className="h-4 w-24 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function getDaysLeftLabel(departureDatetime) {
  const now = Date.now();
  const departure = new Date(departureDatetime).getTime();
  const diffMs = departure - now;
  if (diffMs <= 0) return "Passé";
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days === 1) return "Demain";
  return `J-${days}`;
}

function RideCard({ r, index, onCancel, onRepost, busy }) {
  const status = STATUS_CONFIG[r.status] || STATUS_CONFIG.COMPLETED;
  const occupancyPct = r.seats_total > 0
    ? Math.round(((r.seats_total - r.seats_available) / r.seats_total) * 100)
    : 0;

  return (
    <div
      className="bg-gray-900/60 backdrop-blur-xl border border-white/5 hover:border-indigo-500/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 group relative overflow-hidden"
      style={{
        animationName: "fadeSlideIn",
        animationDuration: "0.4s",
        animationTimingFunction: "ease-out",
        animationFillMode: "both",
        animationDelay: `${index * 70}ms`,
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <span className="text-white font-bold text-lg group-hover:text-indigo-300 transition-colors">
          {r.departure_city}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-400 shrink-0">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        <span className="text-white font-bold text-lg group-hover:text-indigo-300 transition-colors">
          {r.arrival_city}
        </span>
        <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${status.cls}`}>
          {status.label}
        </span>
        {r.status === "OPEN" && (
          <span className="text-xs font-bold px-3 py-1 rounded-full border bg-indigo-500/15 text-indigo-300 border-indigo-500/30">
            {getDaysLeftLabel(r.departure_datetime)}
          </span>
        )}
      </div>

      {/* Infos grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-6 relative z-10">
        <div className="bg-gray-800/30 rounded-2xl p-3 border border-white/5">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Date</p>
          <p className="text-gray-300 font-medium leading-relaxed">
            {new Date(r.departure_datetime).toLocaleString("fr-MG", { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
          </p>
        </div>
        <div className="bg-gray-800/30 rounded-2xl p-3 border border-white/5">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Prix par place</p>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-black text-lg">
            {Number(r.price).toLocaleString()} <span className="text-xs text-gray-500">Ar</span>
          </p>
        </div>
        <div className="bg-gray-800/30 rounded-2xl p-3 border border-white/5">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Places dispo</p>
          <p className="text-gray-300 font-bold text-lg">
            {r.seats_available} <span className="text-gray-600 text-sm font-normal">/ {r.seats_total}</span>
          </p>
        </div>
        <div className="bg-gray-800/30 rounded-2xl p-3 border border-white/5">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Véhicule</p>
          <p className="text-gray-300 font-bold uppercase text-xs">
            {r.plate || "—"}
          </p>
        </div>
      </div>

      {/* Barre occupation + boutons */}
      <div className="flex flex-wrap items-center gap-4 relative z-10">
        <div className="flex-1 min-w-[150px]">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-gray-400 text-xs font-medium">Occupation</span>
            <span className="text-white text-xs font-bold">{occupancyPct}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 shadow-[0_0_10px_currentColor]"
              style={{
                width: `${occupancyPct}%`,
                background: occupancyPct >= 80 ? "#10b981" : occupancyPct >= 50 ? "#f59e0b" : "#6366f1",
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => onRepost(r.id)}
            disabled={busy}
            className="text-xs font-bold px-4 py-2 rounded-xl border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            {busy ? "Repost..." : "Reposter"}
          </button>

          {/* Bouton annuler — visible seulement si OPEN */}
          {r.status === "OPEN" && (
            <button
              type="button"
              onClick={() => onCancel(r.id)}
              className="text-xs font-bold px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-400/60 transition-all"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyRidesPage() {
  const [rides, setRides] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [reposting, setReposting] = useState(null);
  const [success, setSuccess] = useState("");

  async function loadRides() {
    setLoading(true);
    api.get("/rides/me/rides")
      .then(({ data }) => setRides(data.rides || []))
      .catch((err) => setError(err.response?.data?.message || "Impossible de charger tes trajets."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadRides(); }, []);

  async function handleCancel(rideId) {
    if (!window.confirm("Annuler ce trajet ? Toutes les réservations associées seront aussi annulées.")) return;
    setCancelling(rideId);
    setError("");
    try {
      await api.patch(`/rides/${rideId}/cancel`);
      await loadRides();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'annuler ce trajet.");
    } finally {
      setCancelling(null);
    }
  }

  async function handleRepost(rideId) {
    const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);
    const departureInput = window.prompt(
      "Nouvelle date/heure de départ (format: YYYY-MM-DDTHH:mm)",
      defaultDate
    );
    if (!departureInput) return;

    setReposting(rideId);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.get(`/rides/${rideId}`);
      const ride = data.ride;
      await api.post("/rides", {
        departure_city: ride.departure_city,
        arrival_city: ride.arrival_city,
        departure_datetime: departureInput,
        price: ride.price,
        seats_total: ride.seats_total,
        description: ride.description,
        vehicle_brand: ride.vehicle_brand,
        vehicle_model: ride.vehicle_model,
        vehicle_plate: ride.vehicle_plate,
      });
      setSuccess("Trajet reposté avec succès.");
      await loadRides();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de reposter ce trajet.");
    } finally {
      setReposting(null);
    }
  }

  const openCount      = rides.filter(r => r.status === "OPEN").length;
  const cancelledCount = rides.filter(r => r.status === "CANCELLED").length;
  const completedCount = rides.filter(r => r.status === "COMPLETED").length;
  const completedRevenue = rides
    .filter((r) => r.status === "COMPLETED")
    .reduce(
      (sum, r) => sum + (Number(r.seats_total) - Number(r.seats_available)) * Number(r.price),
      0
    );
  const upcomingRevenue = rides
    .filter((r) => r.status === "OPEN")
    .reduce(
      (sum, r) => sum + (Number(r.seats_total) - Number(r.seats_available)) * Number(r.price),
      0
    );
  const totalRevenue = completedRevenue + upcomingRevenue;
  const upcomingRides = rides.filter(
    (r) => r.status === "OPEN" && new Date(r.departure_datetime).getTime() > Date.now()
  );
  const historyRides = rides.filter((r) => !upcomingRides.some((up) => up.id === r.id));

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-12 relative overflow-hidden selection:bg-indigo-500/30">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[20%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Trajets publiés</span>
            </h1>
            <p className="text-gray-400 font-medium">
              Gérez vos annonces de covoiturage ({rides.length} trajet{rides.length !== 1 ? "s" : ""})
            </p>
          </div>
          <Link
            to="/me/rides/new"
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Publier un trajet
          </Link>
        </div>

        {/* Stat mini cards */}
        {rides.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Ouverts",  value: openCount,      color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Terminés", value: completedCount, color: "text-gray-300", bg: "bg-gray-700/20" },
              { label: "Annulés",  value: cancelledCount, color: "text-red-400", bg: "bg-red-500/10" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-center relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-16 h-16 ${s.bg} rounded-bl-full opacity-50`}></div>
                <p className={`text-3xl font-black ${s.color} relative z-10`}>{s.value}</p>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1 relative z-10">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {rides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 border-l-4 border-l-indigo-500">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Revenu estimé total</p>
              <p className="text-white text-2xl font-black">{totalRevenue.toLocaleString()} <span className="text-sm text-gray-500">Ar</span></p>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 border-l-4 border-l-gray-600">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Revenu trajets terminés</p>
              <p className="text-gray-300 text-2xl font-black">{completedRevenue.toLocaleString()} <span className="text-sm text-gray-500">Ar</span></p>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 border-l-4 border-l-cyan-500">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Revenu trajets en cours</p>
              <p className="text-cyan-400 text-2xl font-black">{upcomingRevenue.toLocaleString()} <span className="text-sm text-gray-500">Ar</span></p>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl px-6 py-4 mb-8 shadow-xl">
            <span className="font-bold">Erreur :</span> {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-2xl px-6 py-4 mb-8 shadow-xl font-medium">
            {success}
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Vide */}
        {!loading && rides.length === 0 && !error && (
          <div className="text-center py-20 bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl">
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="w-10 h-10 text-indigo-400">
                <path d="M5 17H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13l4 4v6a2 2 0 0 1-2 2h-2"/>
                <circle cx="8.5" cy="17" r="2.5"/><circle cx="17.5" cy="17" r="2.5"/>
              </svg>
            </div>
            <p className="text-white text-xl font-bold mb-2">Aucun trajet publié</p>
            <p className="text-gray-400">
              Proposez vos places libres et partagez vos frais de route.
            </p>
            <Link to="/me/rides/new" className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all">
              Publier mon premier trajet
            </Link>
          </div>
        )}

        {/* Liste */}
        {!loading && upcomingRides.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-white">Trajets à venir</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
            </div>
            <div className="space-y-6 mb-12">
              {upcomingRides.map((r, i) => (
                <RideCard
                  key={r.id}
                  r={r}
                  index={i}
                  onCancel={handleCancel}
                  onRepost={handleRepost}
                  busy={reposting === r.id}
                />
              ))}
            </div>
          </>
        )}

        {!loading && historyRides.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-6 mt-8">
              <h2 className="text-xl font-bold text-gray-300">Historique des trajets</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>
            </div>
            <div className="space-y-6 opacity-80 hover:opacity-100 transition-opacity">
              {historyRides.map((r, i) => (
                <RideCard
                  key={r.id}
                  r={r}
                  index={i}
                  onCancel={handleCancel}
                  onRepost={handleRepost}
                  busy={reposting === r.id}
                />
              ))}
            </div>
          </>
        )}

        {/* Toast annulation en cours */}
        {cancelling && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/10 text-white text-sm font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
            <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Annulation en cours...
          </div>
        )}

      </div>
    </div>
  );
}