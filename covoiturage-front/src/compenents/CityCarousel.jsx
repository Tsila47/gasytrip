import { useNavigate } from "react-router-dom";

import tana from "../assets/cities/Antananarivo.jpg";
import toamasina from "../assets/cities/Toamasina.jpg";
import diego from "../assets/cities/Diego.jpg";
import mahajanga from "../assets/cities/Mahajanga.jpg";
import fianara from "../assets/cities/Fianara.jpg";
import tulear from "../assets/cities/Tulear.jpg";
import morondava from "../assets/cities/Morondava.jpg";

const CITIES = [
  { name: "Antananarivo", sub: "Capitale · Analamanga", img: tana },
  { name: "Toamasina", sub: "Port · Côte Est", img: toamasina },
  { name: "Diego-Suarez", sub: "Antsiranana · Nord", img: diego },
  { name: "Mahajanga", sub: "Boeny · Côte Ouest", img: mahajanga },
  { name: "Fianarantsoa", sub: "Haute Matsiatra", img: fianara },
  { name: "Tuléar", sub: "Toliara · Grand Sud", img: tulear },
  { name: "Morondava", sub: "Menabe · Baobabs", img: morondava },
];

export default function CityCarousel() {
  const navigate = useNavigate();
  const doubled = [...CITIES, ...CITIES];

  function handleClick(cityName) {
    navigate(`/rides?arrival_city=${encodeURIComponent(cityName)}`);
  }

  return (
    <div className="py-12 overflow-hidden">
      <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest text-center mb-6">
        Destinations populaires
      </p>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-4 w-max"
          style={{ animation: "carousel-scroll 32s linear infinite" }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
        >
          {doubled.map((city, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(city.name)}
              className="relative w-90 h-55 rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/60 shrink-0 transition-all hover:scale-105 group"
            >
              <img
                src={city.img}
                alt={city.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <p className="text-white font-bold text-sm leading-tight">{city.name}</p>
                <p className="text-indigo-300 text-xs mt-0.5">{city.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes carousel-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}