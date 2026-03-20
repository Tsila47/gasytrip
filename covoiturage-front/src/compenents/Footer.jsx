import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Logo + copyright */}
          <div className="flex items-center gap-2">
            <span className="text-indigo-400">🌴</span>
            <span className="text-white font-bold">
              Gasy<span className="text-indigo-400">Trip</span>
            </span>
            <span className="text-gray-600 text-sm ml-2">
              © {year} · Covoiturage à Madagascar
            </span>
          </div>

          {/* Liens */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-300 transition-colors">
              Accueil
            </Link>
            <Link to="/rides" className="hover:text-gray-300 transition-colors">
              Trajets
            </Link>
            <Link to="/me/rides/new" className="hover:text-gray-300 transition-colors">
              Publier
            </Link>
            <a
              href="mailto:randriatsilavina47@gmail.com"
              className="hover:text-gray-300 transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Tagline */}
          <p className="text-gray-600 text-xs italic">
            Partagez la route 🛣️
          </p>
        </div>
      </div>
    </footer>
  );
}