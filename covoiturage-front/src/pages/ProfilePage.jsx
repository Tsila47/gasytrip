import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

function Avatar({ name, size = "lg" }) {
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

  const colorIndex = name
    ? name.charCodeAt(0) % colors.length
    : 0;

  const sizeClass = size === "lg"
    ? "w-24 h-24 text-3xl"
    : "w-12 h-12 text-lg";

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-bold text-white shadow-lg`}>
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ ridesCount: 0, passengersCount: 0, bookingsCount: 0 });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadProfile() {
    setLoading(true);
    try {
      const [{ data: meData }, { data: ridesData }, { data: bookingsData }] = await Promise.all([
        api.get("/auth/me"),
        api.get("/rides/me/rides"),
        api.get("/rides/me/bookings"),
      ]);

      setProfile(meData.user);
      setForm({ name: meData.user.name, phone: meData.user.phone || "" });

      const rides = ridesData.rides || [];
      const bookings = bookingsData.bookings || [];

      // Nombre total de passagers transportés (réservations confirmées sur ses trajets)
      const passengersCount = rides.reduce((acc, r) => {
        return acc + (r.seats_total - r.seats_available);
      }, 0);

      setStats({
        ridesCount: rides.filter(r => r.status !== "CANCELLED").length,
        passengersCount,
        bookingsCount: bookings.filter(b => b.status === "CONFIRMED").length,
      });
    } catch (err) {
      setError("Impossible de charger le profil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProfile(); }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.patch("/auth/me", form);
      setProfile(data.user);
      // Met à jour le token pour que la Navbar reflète le nouveau nom
      const token = localStorage.getItem("token");
      if (token) login(token);
      setSuccess("Profil mis à jour avec succès !");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  }

  const isDriver = stats.ridesCount > 0;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("fr-MG", { year: "numeric", month: "long" })
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">

        <h1 className="text-2xl font-bold text-white mb-8">Mon profil</h1>

        {loading && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 animate-pulse h-48" />
          </div>
        )}

        {!loading && profile && (
          <div className="space-y-4">

            {/* Carte profil */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-start gap-6">
                <Avatar name={profile.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="text-white font-bold text-xl">{profile.name}</h2>
                    {isDriver && (
                      <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
                        🚗 Conducteur
                      </span>
                    )}
                    {profile.role === "ADMIN" && (
                      <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
                        ⚡ Admin
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{profile.email}</p>
                  {profile.phone && (
                    <p className="text-gray-400 text-sm mb-1">📞 {profile.phone}</p>
                  )}
                  {memberSince && (
                    <p className="text-gray-600 text-xs mt-2">Membre depuis {memberSince}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(!editing)}
                  className="shrink-0 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-xs font-medium px-4 py-2 rounded-xl transition-all"
                >
                  {editing ? "Annuler" : "Modifier"}
                </button>
              </div>

              {/* Formulaire modification */}
              {editing && (
                <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-gray-800 space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="+261 34 00 000 00"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </form>
              )}

              {success && !editing && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3">
                  {success}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Trajets publiés",     value: stats.ridesCount,      color: "text-indigo-400", icon: "🚗" },
                { label: "Passagers transportés", value: stats.passengersCount, color: "text-emerald-400", icon: "👥" },
                { label: "Réservations actives", value: stats.bookingsCount,   color: "text-amber-400",  icon: "🎫" },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Badge conducteur */}
            {isDriver && (
              <div className="bg-gray-900 border border-indigo-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    🏅
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-0.5">Badge Conducteur GasyTrip</h3>
                    <p className="text-gray-400 text-sm">
                      Tu as publié {stats.ridesCount} trajet{stats.ridesCount > 1 ? "s" : ""} et transporté {stats.passengersCount} passager{stats.passengersCount > 1 ? "s" : ""} sur la plateforme.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}