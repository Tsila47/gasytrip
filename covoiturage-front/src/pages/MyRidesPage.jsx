import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const STATUS_CONFIG = {
  OPEN:      { label: "Ouvert",   cls: "bg-green-500/20 text-green-400 border-green-500/30" },
  CANCELLED: { label: "Annulé",   cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  COMPLETED: { label: "Terminé",  cls: "bg-gray-700/60 text-gray-400 border-gray-600" },
};

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
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
      className="bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 group"
      style={{
        animationName: "fadeSlideIn",
        animationDuration: "0.4s",
        animationTimingFunction: "ease-out",
        animationFillMode: "both",
        animationDelay: `${index * 70}ms`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white font-bold text-base group-hover:text-indigo-100 transition-colors">
          {r.departure_city}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-400 shrink-0">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        <span className="text-white font-bold text-base group-hover:text-indigo-100 transition-colors">
          {r.arrival_city}
        </span>
        <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full border ${status.cls}`}>
          {status.label}
        </span>
        {r.status === "OPEN" && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-indigo-500/15 text-indigo-300 border-indigo-500/30">
            {getDaysLeftLabel(r.departure_datetime)}
          </span>
        )}
      </div>

      {/* Infos grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Date</p>
          <p className="text-gray-300 text-xs leading-relaxed">
            {new Date(r.departure_datetime).toLocaleString("fr-MG")}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Prix</p>
          <p className="text-indigo-400 font-bold">{Number(r.price).toLocaleString()} Ar</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Places</p>
          <p className="text-gray-300">
            <span className="text-white font-semibold">{r.seats_available}</span>
            <span className="text-gray-600"> / {r.seats_total}</span>
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Immatriculation</p>
          <p className="text-gray-300 font-mono text-xs bg-gray-800 px-2 py-1 rounded-lg inline-block">
            {r.plate || "—"}
          </p>
        </div>
      </div>

      {/* Barre occupation + bouton annuler */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${occupancyPct}%`,
              background: occupancyPct >= 80 ? "#f87171" : occupancyPct >= 50 ? "#fbbf24" : "#818cf8",
            }}
          />
        </div>
        <span className="text-gray-500 text-xs shrink-0">{occupancyPct}% occupé</span>

        <button
          type="button"
          onClick={() => onRepost(r.id)}
          disabled={busy}
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 disabled:opacity-50 transition-all"
        >
          {busy ? "Repost..." : "Reposter"}
        </button>

        {/* Bouton annuler — visible seulement si OPEN */}
        {r.status === "OPEN" && (
          <button
            type="button"
            onClick={() => onCancel(r.id)}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-400/60 transition-all"
          >
            Annuler le trajet
          </button>
        )}
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
    <div className="min-h-screen bg-gray-950 text-white">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Mes trajets</h1>
            <p className="text-gray-400 text-sm">
              {rides.length} trajet{rides.length !== 1 ? "s" : ""} publié{rides.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            to="/me/rides/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105"
          >
            + Publier
          </Link>
        </div>

        {/* Stat mini cards */}
        {rides.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Ouverts",  value: openCount,      color: "text-green-400" },
              { label: "Terminés", value: completedCount, color: "text-gray-300" },
              { label: "Annulés",  value: cancelledCount, color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {rides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Revenu estimé total</p>
              <p className="text-emerald-400 text-xl font-bold">{totalRevenue.toLocaleString()} Ar</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Revenu trajets terminés</p>
              <p className="text-indigo-300 text-xl font-bold">{completedRevenue.toLocaleString()} Ar</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Revenu trajets en cours</p>
              <p className="text-amber-300 text-xl font-bold">{upcomingRevenue.toLocaleString()} Ar</p>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-6">
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
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="w-8 h-8 text-gray-600">
                <path d="M5 17H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13l4 4v6a2 2 0 0 1-2 2h-2"/>
                <circle cx="8.5" cy="17" r="2.5"/><circle cx="17.5" cy="17" r="2.5"/>
              </svg>
            </div>
            <p className="text-gray-400 font-medium mb-1">Aucun trajet publié</p>
            <p className="text-gray-600 text-sm">
              Clique sur{" "}
              <span className="text-indigo-400 font-medium">+ Publier</span>
              {" "}en haut pour commencer
            </p>
          </div>
        )}

        {/* Liste */}
        {!loading && upcomingRides.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wider">
              Trajets à venir
            </h2>
            <div className="space-y-4 mb-8">
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
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Historique</h2>
        )}

        {!loading && (
          <div className="space-y-4">
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
        )}

        {/* Toast annulation en cours */}
        {cancelling && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
            Annulation en cours...
          </div>
        )}

      </div>
    </div>
  );
}