import { useState } from "react";
import { useNavigate } from "react-router-dom";
import hero from "../assets/gasyTrip.png";
import CityCarousel from "../compenents/CityCarousel.jsx";

const CITIES = ["Antananarivo", "Toamasina", "Diego-Suarez", "Mahajanga", "Fianarantsoa", "Tuléar", "Antsiranana", "Morondava"];

export default function HomePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    departure_city: "", arrival_city: "",
    departure_datetime: "", price_max: "", seats_min: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/rides?${params.toString()}`);
  }

  function handleCityClick(city, field) {
    setForm((f) => ({ ...f, [field]: city }));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="relative h-[92vh] flex items-center justify-center overflow-hidden">
        <img
          src={hero}
          alt="GasyTrip hero"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />

        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 text-center">
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Covoiturage à Madagascar
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
            Partagez la route,<br />
            <span className="text-indigo-400">voyagez ensemble</span>
          </h1>
          <p className="text-gray-400 text-base mb-8">
            Tana, Diego, Toamasina, Tuléar — trouvez ou proposez un trajet facilement.
          </p>

          {/* Formulaire de recherche */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-2xl p-5 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                name="departure_city"
                placeholder="Ville de départ"
                value={form.departure_city}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <input
                name="arrival_city"
                placeholder="Ville d'arrivée"
                value={form.arrival_city}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <input
                type="datetime-local"
                name="departure_datetime"
                value={form.departure_datetime}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <input
                name="seats_min"
                type="number"
                placeholder="Places minimum"
                value={form.seats_min}
                onChange={handleChange}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide"
            >
              Rechercher un trajet
            </button>
          </form>
        </div>
      </div>

      {/* Villes populaires */}
      <CityCarousel className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
          Destinations populaires
        </h2>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleCityClick(city, form.departure_city ? "arrival_city" : "departure_city")}
              className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-indigo-500 text-gray-300 hover:text-white text-sm px-4 py-2 rounded-full transition-all"
            >
              {city}
            </button>
          ))}
        </div>
      </CityCarousel>

      {/* Features */}
        <div className="max-w-4xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
       {[
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M9 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5"/>
          <circle cx="17" cy="17" r="3"/><circle cx="8" cy="17" r="3"/>
          <path d="M9 17H5M14 17h-3"/>
        </svg>
      ),
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      title: "Trajets vérifiés",
      desc: "Conducteurs et véhicules enregistrés sur la plateforme",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <circle cx="12" cy="12" r="9"/>
          <path d="M14.5 9a2.5 2.5 0 0 0-5 0c0 4 5 4 5 8a2.5 2.5 0 0 1-5 0"/>
          <path d="M12 6v2M12 16v2"/>
        </svg>
      ),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      title: "Prix abordables",
      desc: "Partagez les frais de route entre voyageurs",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      ),
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      title: "Partout à Madagascar",
      desc: "Tana, Diego, côte Est, côte Ouest et plus encore",
    },
  ].map((f) => (
    <div
      key={f.title}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 group hover:border-gray-700 transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${f.bg} ${f.color} mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        {f.icon}
      </div>
      <h3 className="text-white font-semibold mb-2">{f.title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
    </div>
  ))}
</div>
      {/* <div className="max-w-4xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "🚗", title: "Trajets vérifiés", desc: "Conducteurs et véhicules enregistrés sur la plateforme" },
          { icon: "💰", title: "Prix abordables", desc: "Partagez les frais de route entre voyageurs" },
          { icon: "🌴", title: "Partout à Madagascar", desc: "Tana, Diego, côte Est, côte Ouest et plus encore" },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-white font-semibold mb-1">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        // ))} */}
      {/* </div> */}
    </div>
    
  );
}