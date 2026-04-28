import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const CLOUD_NAME = "dvxvs6upk";
const UPLOAD_PRESET = "gasytrip_avatars";

function Avatar({ name, photoUrl, size = "lg" }) {
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
  const sizeClass = size === "lg" ? "w-28 h-28 text-4xl" : "w-10 h-10 text-sm";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shadow-2xl border-4 border-indigo-500/30 shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-black text-white shadow-2xl shrink-0 border-4 border-white/10`}>
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const { login } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ ridesCount: 0, passengersCount: 0, bookingsCount: 0 });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

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
      if (meData.user.photo_url) setPhotoUrl(meData.user.photo_url);

      const rides = ridesData.rides || [];
      const bookings = bookingsData.bookings || [];
      const passengersCount = rides.reduce((acc, r) => acc + (r.seats_total - r.seats_available), 0);

      setStats({
        ridesCount: rides.filter(r => r.status !== "CANCELLED").length,
        passengersCount,
        bookingsCount: bookings.filter(b => b.status === "CONFIRMED").length,
      });
    } catch {
      setError("Impossible de charger le profil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProfile(); }, []);

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Fichier invalide — image uniquement.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop lourde — 5MB maximum.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "gasytrip/avatars");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Échec upload");

      const url = data.secure_url;
      setPhotoUrl(url);

      await api.patch("/auth/me", {
        name: profile.name,
        phone: profile.phone,
        photo_url: url,
      });
      setSuccess("Photo de profil mise à jour !");
    } catch (err) {
      setError(err.message || "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.patch("/auth/me", { ...form, photo_url: photoUrl });
      setProfile(data.user);
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

  const inputClass = "w-full bg-gray-900 border border-gray-700/50 rounded-xl px-4 py-3.5 text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all";

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-12 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h1 className="text-3xl font-black text-white mb-8 tracking-tight">Mon <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Espace</span></h1>

        {loading && (
          <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-8 animate-pulse h-64" />
        )}

        {!loading && profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Avatar & Basic Info */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 opacity-50"></div>
                
                <div className="relative mx-auto w-fit mb-4 mt-6">
                  <Avatar name={profile.name} photoUrl={photoUrl} size="lg" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 border-4 border-[#0d1326]"
                    title="Changer de photo"
                  >
                    {uploading ? (
                      <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </div>

                <h2 className="text-white font-bold text-2xl tracking-tight relative z-10">{profile.name}</h2>
                <div className="flex flex-wrap justify-center gap-2 mt-3 relative z-10">
                  {isDriver && (
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-3 py-1.5 rounded-full">
                      Conducteur
                    </span>
                  )}
                  {profile.role === "ADMIN" && (
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                      Admin
                    </span>
                  )}
                </div>

                <div className="mt-6 space-y-2 relative z-10 text-left bg-gray-800/40 rounded-2xl p-4 border border-white/5">
                  <p className="text-gray-300 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <span className="truncate">{profile.email}</span>
                  </p>
                  {profile.phone && (
                    <p className="text-gray-300 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      {profile.phone}
                    </p>
                  )}
                  {memberSince && (
                    <p className="text-gray-500 text-xs mt-4 pt-4 border-t border-gray-700/50">Inscrit(e) en {memberSince}</p>
                  )}
                </div>
              </div>

              {isDriver && (
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-6 shadow-lg shadow-indigo-500/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                      🏅
                    </div>
                    <div>
                      <h3 className="text-indigo-100 font-bold text-sm">Conducteur GasyTrip</h3>
                      <p className="text-indigo-300/70 text-xs mt-1 leading-relaxed">
                        {stats.ridesCount} trajets proposés
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Edit Form & Stats */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Trajets publiés", value: stats.ridesCount, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                  { label: "Passagers transportés", value: stats.passengersCount, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { label: "Trajets réservés", value: stats.bookingsCount, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                ].map(s => (
                  <div key={s.label} className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-bl-full opacity-50`}></div>
                    <p className={`text-4xl font-black ${s.color} mb-2 relative z-10`}>{s.value}</p>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider relative z-10 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Edit Profile Form */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">Informations Personnelles</h2>
                  <button
                    type="button"
                    onClick={() => { setEditing(!editing); setSuccess(""); }}
                    className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
                      editing ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                    }`}
                  >
                    {editing ? "Annuler" : "Modifier"}
                  </button>
                </div>

                {error && <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl px-6 py-4">{error}</div>}
                {success && !editing && <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-2xl px-6 py-4 font-medium">{success}</div>}

                {editing ? (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div>
                      <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Nom complet</label>
                      <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Téléphone</label>
                      <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+261 34 00 000 00" className={inputClass} />
                    </div>
                    <div className="pt-4">
                      <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25">
                        {saving ? "Enregistrement en cours..." : "Sauvegarder les modifications"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-gray-800/30 rounded-2xl p-4 border border-white/5">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Nom complet</p>
                        <p className="text-white font-medium text-lg">{profile.name}</p>
                      </div>
                      <div className="bg-gray-800/30 rounded-2xl p-4 border border-white/5">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Téléphone</p>
                        <p className="text-white font-medium text-lg">{profile.phone || <span className="text-gray-600 italic">Non renseigné</span>}</p>
                      </div>
                    </div>
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