import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors";
const labelClass = "text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1.5";

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
      await api.post("/rides", {
        ...form,
        price: form.price === "" ? undefined : Number(form.price),
        seats_total: form.seats_total === "" ? undefined : Number(form.seats_total),
      });
      setSuccess("Trajet publié avec succès !");
      setTimeout(() => navigate("/me/rides"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du trajet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Publier un trajet</h1>
        <p className="text-gray-400 text-sm mb-8">Remplis les informations de ton trajet</p>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trajet */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-semibold">Itinéraire</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Ville de départ</label>
                <input name="departure_city" placeholder="Antananarivo" value={form.departure_city}
                  onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ville d'arrivée</label>
                <input name="arrival_city" placeholder="Toamasina" value={form.arrival_city}
                  onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Date et heure de départ</label>
              <input type="datetime-local" name="departure_datetime" value={form.departure_datetime}
                onChange={handleChange} className={inputClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Prix par place (Ariary)</label>
                <input name="price" type="number" placeholder="5000" value={form.price}
                  onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nombre de places</label>
                <input name="seats_total" type="number" placeholder="3" value={form.seats_total}
                  onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description (optionnel)</label>
              <textarea name="description" placeholder="Infos supplémentaires sur le trajet..." value={form.description}
                onChange={handleChange} rows={3}
                className={`${inputClass} resize-none`} />
            </div>
          </div>

          {/* Véhicule */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-semibold">Véhicule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Marque</label>
                <input name="vehicle_brand" placeholder="Toyota" value={form.vehicle_brand}
                  onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Modèle</label>
                <input name="vehicle_model" placeholder="HiAce" value={form.vehicle_model}
                  onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Immatriculation</label>
              <input name="vehicle_plate" placeholder="ex: 1234 TA" value={form.vehicle_plate}
                onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            {loading ? "Publication..." : "Publier le trajet"}
          </button>
        </form>
      </div>
    </div>
  );
}