import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";

const inputClass = "w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl px-5 py-4 text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all focus:bg-gray-800";
const labelClass = "text-gray-400 text-xs font-bold uppercase tracking-widest block mb-2";

export default function CreateRidePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    departure_city: "", arrival_city: "", departure_datetime: "",
    price: "", seats_total: "", description: "",
    vehicle_brand: "", vehicle_model: "", vehicle_plate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const priceNum = form.price === "" ? undefined : Number(form.price);
      const seatsTotalNum = form.seats_total === "" ? undefined : Number(form.seats_total);
      if (priceNum === undefined || !Number.isFinite(priceNum) || priceNum < 0) {
        setError("Prix invalide. Utilise un nombre (ex: 25000).");
        return;
      }
      if (seatsTotalNum === undefined || !Number.isFinite(seatsTotalNum) || seatsTotalNum <= 0) {
        setError("Nombre de places invalide.");
        return;
      }

      await api.post("/rides", {
        ...form,
        price: priceNum,
        seats_total: seatsTotalNum,
      });
      setSuccess("Trajet publié avec succès !");
      setTimeout(() => navigate("/me/rides"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du trajet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-12 px-4 relative selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-cyan-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        <div className="text-center mb-12">
          <Link to="/me/rides" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-400 transition-colors mb-6 font-medium text-sm">
            ← Mes trajets
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Proposer un <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">trajet</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Partagez vos frais de route et faites de nouvelles rencontres en proposant vos places libres.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl px-6 py-4 mb-8 text-center shadow-lg animate-bounce">
            <span className="font-bold">Erreur :</span> {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-2xl px-6 py-4 mb-8 text-center shadow-lg flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            <span className="font-bold">{success}</span> Redirection en cours...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Itinéraire & Dates */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Le voyage</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Ville de départ</label>
                  <input name="departure_city" placeholder="Ex: Antananarivo" value={form.departure_city} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Ville d'arrivée</label>
                  <input name="arrival_city" placeholder="Ex: Toamasina" value={form.arrival_city} onChange={handleChange} className={inputClass} required />
                </div>
              </div>

              <div>
                <label className={labelClass}>Date et heure de départ</label>
                <input type="datetime-local" name="departure_datetime" value={form.departure_datetime} onChange={handleChange} className={`${inputClass} [color-scheme:dark]`} required />
              </div>

              <div>
                <label className={labelClass}>Lieu de rendez-vous ou détails (Optionnel)</label>
                <textarea name="description" placeholder="Ex: Départ devant Jumbo Score, 2 bagages max par personne..." value={form.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>

          {/* Section 2: Places & Prix */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Tarif et places</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Prix par place (Ar)</label>
                <div className="relative">
                  <input name="price" type="number" min="0" step="1000" placeholder="Ex: 25000" value={form.price} onChange={handleChange} className={inputClass} required />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Ar</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>Places disponibles</label>
                <div className="relative">
                  <input name="seats_total" type="number" min="1" max="8" placeholder="Ex: 3" value={form.seats_total} onChange={handleChange} className={inputClass} required />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500">passagers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Véhicule */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Votre véhicule</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelClass}>Marque</label>
                <input name="vehicle_brand" placeholder="Ex: Peugeot" value={form.vehicle_brand} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Modèle</label>
                <input name="vehicle_model" placeholder="Ex: 3008" value={form.vehicle_model} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Plaque d'immatriculation</label>
              <input name="vehicle_plate" placeholder="Ex: 1234 TA" value={form.vehicle_plate} onChange={handleChange} className={`${inputClass} uppercase`} required />
              <p className="text-gray-500 text-xs mt-2">Visible uniquement par les passagers confirmés.</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-white rounded-2xl font-black text-xl text-gray-900 px-8 py-5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-white transition-colors">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Publication en cours...
                  </>
                ) : (
                  <>
                    Publier le trajet maintenant
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </>
                )}
              </span>
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}