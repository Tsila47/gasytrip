import { Link, useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Illustration */}
        <div className="relative mb-8">
          <p className="text-8xl font-black text-gray-800 select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">🛣️</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Route introuvable
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          La page que tu cherches n'existe pas ou a été déplacée.
          Peut-être que le trajet a été annulé ? 😄
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            🏠 Retour à l'accueil
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            ← Page précédente
          </button>
        </div>

        <p className="text-gray-700 text-xs mt-8 italic">
          GasyTrip — Partagez la route, voyagez ensemble 🌴
        </p>
      </div>
    </div>
  );
}