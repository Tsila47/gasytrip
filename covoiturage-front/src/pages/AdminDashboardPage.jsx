import { useEffect, useState } from "react";
import api from "../services/api.js";

const STATUS_STYLE = {
  OPEN:      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border border-red-500/30",
  COMPLETED: "bg-gray-700/50 text-gray-400 border border-gray-600",
  CONFIRMED: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
};

function StatCard({ label, value, color, bgIcon, icon }) {
  return (
    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className={`absolute top-0 right-0 w-24 h-24 ${bgIcon} rounded-bl-full opacity-50`}></div>
      <div className="flex justify-between items-start relative z-10 mb-4">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-4xl font-black ${color} relative z-10`}>{value}</p>
    </div>
  );
}

function SectionHeader({ title, count, icon }) {
  return (
    <div className="flex items-center justify-between gap-3 px-8 pt-8 pb-6 border-b border-gray-800/50">
      <h2 className="text-white font-bold text-xl flex items-center gap-3">
        {icon}
        {title}
      </h2>
      <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.2)]">
        {count} total
      </span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [{ data: u }, { data: r }, { data: b }] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/rides"),
        api.get("/admin/bookings"),
      ]);
      setUsers(u.users || []);
      setRides(r.rides || []);
      setBookings(b.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement admin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleToggleUser(userId) {
    if (!window.confirm("Modifier le statut de cet utilisateur ?")) return;
    try {
      await api.patch(`/admin/users/${userId}/disable`);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de modifier l'utilisateur.");
    }
  }

  async function handleCancelRide(rideId) {
    if (!window.confirm("Annuler ce trajet ? Toutes les réservations associées seront aussi annulées.")) return;
    try {
      await api.delete(`/admin/rides/${rideId}`);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'annuler le trajet.");
    }
  }

  const activeUsers      = users.filter(u => u.is_active === 1).length;
  const openRides        = rides.filter(r => r.status === "OPEN").length;
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED").length;

  const tabs = [
    { key: "users",    label: "Utilisateurs", icon: "👥" },
    { key: "rides",    label: "Trajets",      icon: "🚗" },
    { key: "bookings", label: "Réservations", icon: "🎫" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-12 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Tableau de bord <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Admin</span>
          </h1>
          <p className="text-gray-400 font-medium">Contrôle global et modération de la plateforme GasyTrip.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl px-6 py-4 mb-8 shadow-xl font-bold flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Utilisateurs Actifs" value={activeUsers} color="text-indigo-400" bgIcon="bg-indigo-500/10" icon="👥" />
          <StatCard label="Trajets Ouverts" value={openRides} color="text-emerald-400" bgIcon="bg-emerald-500/10" icon="🚗" />
          <StatCard label="Réservations" value={confirmedBookings} color="text-amber-400" bgIcon="bg-amber-500/10" icon="🎫" />
          <StatCard label="Total Trajets" value={rides.length} color="text-cyan-400" bgIcon="bg-cyan-500/10" icon="📊" />
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-gray-800/40 text-gray-400 hover:text-white hover:bg-gray-800 border border-white/5"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 animate-pulse h-96" />
        )}

        {/* Tab Utilisateurs */}
        {!loading && activeTab === "users" && (
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <SectionHeader title="Gestion des Utilisateurs" count={users.length} icon="👥" />
            
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/30 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                    <th className="text-left px-8 py-4">Utilisateur</th>
                    <th className="text-left px-8 py-4">Rôle</th>
                    <th className="text-left px-8 py-4">Statut</th>
                    <th className="text-right px-8 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm font-bold shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-bold">{u.name}</p>
                            <p className="text-gray-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${u.role === "ADMIN" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`flex items-center gap-2 text-xs font-bold ${u.is_active === 1 ? "text-emerald-400" : "text-red-400"}`}>
                          <span className={`w-2 h-2 rounded-full ${u.is_active === 1 ? "bg-emerald-400" : "bg-red-400"}`}></span>
                          {u.is_active === 1 ? "Actif" : "Désactivé"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button type="button" onClick={() => handleToggleUser(u.id)}
                          className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all hover:scale-105 ${u.is_active === 1 ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"}`}>
                          {u.is_active === 1 ? "Désactiver" : "Réactiver"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y divide-gray-800/50">
              {users.map(u => (
                <div key={u.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm font-bold shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">{u.name}</p>
                      <p className="text-gray-500 text-xs truncate">{u.email}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleToggleUser(u.id)}
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-colors ${u.is_active === 1 ? "border-red-500/40 text-red-400 bg-red-500/10" : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"}`}>
                    {u.is_active === 1 ? "OFF" : "ON"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Trajets */}
        {!loading && activeTab === "rides" && (
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <SectionHeader title="Trajets Publiés" count={rides.length} icon="🚗" />
            
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/30 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                    <th className="text-left px-8 py-4">Itinéraire</th>
                    <th className="text-left px-8 py-4">Départ</th>
                    <th className="text-left px-8 py-4">Statut</th>
                    <th className="text-left px-8 py-4">Occupation</th>
                    <th className="text-right px-8 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {rides.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{r.departure_city}</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-indigo-400"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                          <span className="text-white font-bold">{r.arrival_city}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-gray-400 text-xs font-medium">
                        {new Date(r.departure_datetime).toLocaleString("fr-MG", { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${STATUS_STYLE[r.status] || STATUS_STYLE.COMPLETED}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                              style={{ width: `${Math.round(((r.seats_total - r.seats_available) / r.seats_total) * 100)}%` }} />
                          </div>
                          <span className="text-gray-400 text-xs font-bold">{r.seats_available}/{r.seats_total} places</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {r.status === "OPEN"
                          ? <button type="button" onClick={() => handleCancelRide(r.id)}
                              className="text-xs font-bold px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors">
                              Annuler
                            </button>
                          : <span className="text-gray-600 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y divide-gray-800/50">
              {rides.map(r => (
                <div key={r.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-bold">{r.departure_city}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-indigo-400"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
                      <span className="text-white text-sm font-bold">{r.arrival_city}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLE[r.status] || STATUS_STYLE.COMPLETED}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="text-gray-500 text-xs font-medium">
                      {new Date(r.departure_datetime).toLocaleDateString("fr-MG")} · {r.seats_available}/{r.seats_total} places dispo
                    </p>
                    {r.status === "OPEN" && (
                      <button type="button" onClick={() => handleCancelRide(r.id)}
                        className="text-xs font-bold px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 self-start">
                        Annuler ce trajet
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Réservations */}
        {!loading && activeTab === "bookings" && (
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <SectionHeader title="Réservations" count={bookings.length} icon="🎫" />
            
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/30 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                    <th className="text-left px-8 py-4">Passager</th>
                    <th className="text-left px-8 py-4">Itinéraire</th>
                    <th className="text-left px-8 py-4">Places</th>
                    <th className="text-left px-8 py-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-bold shrink-0">
                            {b.passenger_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-bold">{b.passenger_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">{b.departure_city}</span>
                          <span className="text-indigo-400">→</span>
                          <span className="text-gray-300">{b.arrival_city}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-gray-400 font-bold">{b.seats_booked} passager(s)</td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${STATUS_STYLE[b.status] || STATUS_STYLE.COMPLETED}`}>
                          {b.status === "CONFIRMED" ? "Confirmée" : "Annulée"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y divide-gray-800/50">
              {bookings.map(b => (
                <div key={b.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-bold shrink-0">
                      {b.passenger_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">{b.passenger_name}</p>
                      <p className="text-gray-500 text-[10px] uppercase tracking-wider truncate mt-0.5">
                        {b.departure_city} → {b.arrival_city}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLE[b.status] || STATUS_STYLE.COMPLETED}`}>
                      {b.status === "CONFIRMED" ? "CONF" : "ANNUL"}
                    </span>
                    <span className="text-gray-500 text-xs font-bold">{b.seats_booked} pl.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}