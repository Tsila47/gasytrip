import { useEffect, useState } from "react";
import api from "../services/api.js";

const STATUS_STYLE = {
  OPEN:      "bg-green-500/20 text-green-400 border border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border border-red-500/30",
  COMPLETED: "bg-gray-700/50 text-gray-400 border border-gray-600",
  CONFIRMED: "bg-green-500/20 text-green-400 border border-green-500/30",
};

function StatCard({ label, value, color = "text-indigo-400" }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center gap-3 px-6 pt-6 mb-4">
      <h2 className="text-white font-semibold text-lg">{title}</h2>
      <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
        {count}
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
    if (!window.confirm("Annuler ce trajet ?")) return;
    try {
      await api.delete(`/admin/rides/${rideId}`);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'annuler le trajet.");
    }
  }

  const tabs = [
    { key: "users",    label: "Utilisateurs", count: users.length },
    { key: "rides",    label: "Trajets",       count: rides.length },
    { key: "bookings", label: "Réservations",  count: bookings.length },
  ];

  const activeUsers      = users.filter(u => u.is_active === 1).length;
  const openRides        = rides.filter(r => r.status === "OPEN").length;
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED").length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard Admin</h1>
          <p className="text-gray-400 text-sm">Gestion de la plateforme GasyTrip</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Utilisateurs actifs"      value={activeUsers}        color="text-indigo-400" />
          <StatCard label="Trajets ouverts"          value={openRides}          color="text-green-400" />
          <StatCard label="Réservations confirmées"  value={confirmedBookings}  color="text-amber-400" />
          <StatCard label="Total trajets"            value={rides.length}       color="text-gray-300" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-white border-indigo-500 bg-gray-900"
                  : "text-gray-400 border-transparent hover:text-gray-200"
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-indigo-500/30 text-indigo-300"
                  : "bg-gray-800 text-gray-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl h-14 animate-pulse" />
            ))}
          </div>
        )}

        {/* Tab Utilisateurs */}
        {!loading && activeTab === "users" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <SectionHeader title="Utilisateurs" count={users.length} />
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-medium">Nom</th>
                    <th className="text-left px-6 py-3 font-medium">Email</th>
                    <th className="text-left px-6 py-3 font-medium">Rôle</th>
                    <th className="text-left px-6 py-3 font-medium">Statut</th>
                    <th className="text-left px-6 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={`border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors ${i === users.length - 1 ? "border-0" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === "ADMIN" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-gray-700/50 text-gray-400 border border-gray-600"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.is_active === 1 ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                          {u.is_active === 1 ? "Actif" : "Désactivé"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button type="button" onClick={() => handleToggleUser(u.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${u.is_active === 1 ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : "border-green-500/40 text-green-400 hover:bg-green-500/10"}`}>
                          {u.is_active === 1 ? "Désactiver" : "Réactiver"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-800">
              {users.map(u => (
                <div key={u.id} className="px-4 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm font-bold shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{u.name}</p>
                      <p className="text-gray-500 text-xs truncate">{u.email}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleToggleUser(u.id)}
                    className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${u.is_active === 1 ? "border-red-500/40 text-red-400" : "border-green-500/40 text-green-400"}`}>
                    {u.is_active === 1 ? "Désactiver" : "Réactiver"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Trajets */}
        {!loading && activeTab === "rides" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <SectionHeader title="Trajets" count={rides.length} />
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-medium">Trajet</th>
                    <th className="text-left px-6 py-3 font-medium">Date</th>
                    <th className="text-left px-6 py-3 font-medium">Statut</th>
                    <th className="text-left px-6 py-3 font-medium">Places</th>
                    <th className="text-left px-6 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((r, i) => (
                    <tr key={r.id} className={`border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors ${i === rides.length - 1 ? "border-0" : ""}`}>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{r.departure_city}</span>
                        <span className="text-indigo-400 mx-2">→</span>
                        <span className="text-white font-medium">{r.arrival_city}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{new Date(r.departure_datetime).toLocaleString("fr-MG")}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[r.status] || STATUS_STYLE.COMPLETED}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.round((r.seats_available / r.seats_total) * 100)}%` }} />
                          </div>
                          <span className="text-gray-400 text-xs">{r.seats_available}/{r.seats_total}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {r.status === "OPEN"
                          ? <button type="button" onClick={() => handleCancelRide(r.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors">
                              Annuler
                            </button>
                          : <span className="text-gray-600 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-800">
              {rides.map(r => (
                <div key={r.id} className="px-4 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-white text-sm font-medium">{r.departure_city}</span>
                      <span className="text-indigo-400 mx-1.5 text-xs">→</span>
                      <span className="text-white text-sm font-medium">{r.arrival_city}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[r.status] || STATUS_STYLE.COMPLETED}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-xs">{new Date(r.departure_datetime).toLocaleDateString("fr-MG")} · {r.seats_available}/{r.seats_total} places</p>
                    {r.status === "OPEN" && (
                      <button type="button" onClick={() => handleCancelRide(r.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400">
                        Annuler
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <SectionHeader title="Réservations" count={bookings.length} />
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-medium">Passager</th>
                    <th className="text-left px-6 py-3 font-medium">Trajet</th>
                    <th className="text-left px-6 py-3 font-medium">Places</th>
                    <th className="text-left px-6 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id} className={`border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors ${i === bookings.length - 1 ? "border-0" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                            {b.passenger_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white">{b.passenger_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300">{b.departure_city}</span>
                        <span className="text-indigo-400 mx-2">→</span>
                        <span className="text-gray-300">{b.arrival_city}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{b.seats_booked} place{b.seats_booked > 1 ? "s" : ""}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[b.status] || STATUS_STYLE.COMPLETED}`}>
                          {b.status === "CONFIRMED" ? "Confirmée" : "Annulée"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-800">
              {bookings.map(b => (
                <div key={b.id} className="px-4 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-bold shrink-0">
                      {b.passenger_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{b.passenger_name}</p>
                      <p className="text-gray-500 text-xs">
                        {b.departure_city} → {b.arrival_city} · {b.seats_booked} place{b.seats_booked > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[b.status] || STATUS_STYLE.COMPLETED}`}>
                    {b.status === "CONFIRMED" ? "Confirmée" : "Annulée"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}