import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import hero from "../assets/gasyTrip.png";
import CityCarousel from "../compenents/CityCarousel.jsx";

const CITIES = ["Antananarivo", "Toamasina", "Diego-Suarez", "Mahajanga", "Fianarantsoa", "Tuléar", "Antsiranana", "Morondava"];

export default function HomePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    departure_city: "", arrival_city: "",
    departure_datetime: "", seats_min: "1",
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="min-h-screen bg-[#0a0f1c] text-white overflow-hidden selection:bg-indigo-500/30">
      
      {/* Premium Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-7000 delay-1000" />
        
        {/* Optional background image blending */}
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
          <img src={hero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c]/50 via-transparent to-[#0a0f1c]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 animate-float">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            La première plateforme de covoiturage à Madagascar
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Partagez la route, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient">voyagez ensemble.</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            Voyagez moins cher, plus confortablement et faites de nouvelles rencontres sur les routes de Madagascar.
          </p>

          {/* Unified Premium Search Bar */}
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <form
              onSubmit={handleSubmit}
              className="relative bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-full p-2 shadow-2xl flex flex-col md:flex-row items-center gap-2"
            >
              <div className="flex-1 w-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-700/50">
                
                {/* Départ */}
                <div className="flex-1 relative flex items-center px-4 py-3 group/input">
                  <svg className="w-5 h-5 text-gray-400 mr-3 group-focus-within/input:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <div className="flex flex-col w-full">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Départ</label>
                    <input
                      name="departure_city"
                      placeholder="Ex: Antananarivo"
                      value={form.departure_city}
                      onChange={handleChange}
                      className="bg-transparent border-none p-0 text-white placeholder-gray-600 focus:ring-0 text-base font-medium w-full focus:outline-none"
                    />
                  </div>
                </div>

                {/* Arrivée */}
                <div className="flex-1 relative flex items-center px-4 py-3 group/input">
                  <svg className="w-5 h-5 text-gray-400 mr-3 group-focus-within/input:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  <div className="flex flex-col w-full">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Arrivée</label>
                    <input
                      name="arrival_city"
                      placeholder="Ex: Toamasina"
                      value={form.arrival_city}
                      onChange={handleChange}
                      className="bg-transparent border-none p-0 text-white placeholder-gray-600 focus:ring-0 text-base font-medium w-full focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="flex-1 relative flex items-center px-4 py-3 group/input">
                  <svg className="w-5 h-5 text-gray-400 mr-3 group-focus-within/input:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <div className="flex flex-col w-full">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Date</label>
                    <input
                      type="date"
                      name="departure_datetime"
                      value={form.departure_datetime}
                      onChange={handleChange}
                      className="bg-transparent border-none p-0 text-white placeholder-gray-600 focus:ring-0 text-base font-medium w-full focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Passagers */}
                <div className="w-full md:w-32 relative flex items-center px-4 py-3 group/input">
                  <svg className="w-5 h-5 text-gray-400 mr-3 group-focus-within/input:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <div className="flex flex-col w-full">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Passagers</label>
                    <input
                      name="seats_min"
                      type="number"
                      min="1"
                      value={form.seats_min}
                      onChange={handleChange}
                      className="bg-transparent border-none p-0 text-white placeholder-gray-600 focus:ring-0 text-base font-medium w-full focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto h-full min-h-[56px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 rounded-xl md:rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25 flex items-center justify-center whitespace-nowrap"
              >
                Rechercher
              </button>
            </form>
          </div>

          {/* CTA: Proposer un trajet */}
          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
            <span className="text-gray-400 text-sm">Vous prenez le volant ?</span>
            <Link to="/me/rides/new" className="group relative px-6 py-2.5 font-semibold text-white rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <span className="relative flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Publier un trajet
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Villes populaires - Styled */}
      <div className="border-t border-b border-gray-800/50 bg-[#0d1326]/50 backdrop-blur-sm">
        <CityCarousel className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent flex-1 opacity-30"></div>
            <h2 className="text-indigo-300 text-xs font-bold uppercase tracking-widest text-center">
              Destinations fréquentes
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent flex-1 opacity-30"></div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCityClick(city, form.departure_city ? "arrival_city" : "departure_city")}
                className="bg-gray-800/50 hover:bg-indigo-500/20 border border-gray-700/50 hover:border-indigo-500/50 text-gray-300 hover:text-white text-sm px-6 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                {city}
              </button>
            ))}
          </div>
        </CityCarousel>
      </div>

      {/* Comment ça marche - Nouvelle section */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">marche ?</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Votre prochain voyage n'est qu'à quelques clics. C'est simple, rapide et sécurisé.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Recherchez", desc: "Entrez vos villes de départ et d'arrivée, puis choisissez la date de votre voyage." },
              { step: "2", title: "Réservez", desc: "Trouvez le trajet qui vous convient et réservez votre place instantanément." },
              { step: "3", title: "Voyagez", desc: "Retrouvez votre conducteur au point de rendez-vous et profitez du trajet." },
            ].map((item, i) => (
              <div key={item.step} className="relative p-8 rounded-3xl bg-gray-900/40 border border-white/5 hover:border-indigo-500/30 transition-colors group">
                <div className="absolute -top-6 left-8 text-6xl font-black text-white/5 group-hover:text-indigo-500/10 transition-colors duration-500">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Features Premium Cards */}
      <section className="py-24 bg-gradient-to-b from-transparent to-[#050810]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <path d="M9 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5"/>
                  <circle cx="17" cy="17" r="3"/><circle cx="8" cy="17" r="3"/>
                  <path d="M9 17H5M14 17h-3"/>
                </svg>
              ),
              color: "text-indigo-400",
              bg: "from-indigo-500/20 to-transparent",
              border: "group-hover:border-indigo-500/50",
              title: "Trajets vérifiés",
              desc: "Chaque conducteur et véhicule est soigneusement vérifié par notre équipe pour garantir votre sécurité.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M14.5 9a2.5 2.5 0 0 0-5 0c0 4 5 4 5 8a2.5 2.5 0 0 1-5 0"/>
                  <path d="M12 6v2M12 16v2"/>
                </svg>
              ),
              color: "text-emerald-400",
              bg: "from-emerald-500/20 to-transparent",
              border: "group-hover:border-emerald-500/50",
              title: "Prix ultra-compétitifs",
              desc: "Partagez les frais de route avec le conducteur et les autres passagers. Voyagez malin et économique.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              ),
              color: "text-amber-400",
              bg: "from-amber-500/20 to-transparent",
              border: "group-hover:border-amber-500/50",
              title: "Partout à Madagascar",
              desc: "De la RN2 à la RN7, trouvez des trajets vers toutes les grandes villes et régions de l'île Rouge.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`relative overflow-hidden bg-gray-900/50 border border-gray-800 rounded-3xl p-8 group transition-all duration-500 hover:-translate-y-2 ${f.border} shadow-2xl shadow-black/50`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${f.bg} rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800/80 border border-gray-700 backdrop-blur-sm ${f.color} mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                {f.icon}
              </div>
              <h3 className="text-xl text-white font-bold mb-3 relative z-10">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed relative z-10">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}