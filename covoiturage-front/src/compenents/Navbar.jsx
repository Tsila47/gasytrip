import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
    setMenuOpen(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const linkClass = (path) =>
    `text-sm transition-colors ${
      location.pathname === path
        ? "text-white font-medium"
        : "text-gray-400 hover:text-white"
    }`;

  return (
    <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 shrink-0">
          <span className="text-indigo-400 text-xl">🌴</span>
          <span className="text-white font-bold text-lg tracking-tight">
            Gasy<span className="text-indigo-400">Trip</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/rides" className={linkClass("/rides")}>Trajets</Link>
          {user ? (
            <>
              <Link to="/me/rides/new" className={linkClass("/me/rides/new")}>Publier</Link>
              <Link to="/me/reservations" className={linkClass("/me/reservations")}>Mes réservations</Link>
              <Link to="/me/rides" className={linkClass("/me/rides")}>Mes trajets</Link>
              {user.role === "ADMIN" && (
                <Link to="/admin" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                  Admin
                </Link>
              )}
              <Link  to="/me/profile" className={linkClass("/me/profile")}>
                Mon profil
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-1.5 rounded-lg border border-gray-700 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass("/login")}>Connexion</Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium text-sm"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Hamburger button (mobile) */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 focus:outline-none"
          aria-label="Menu"
        >
          <span className={`block h-0.5 w-6 bg-gray-400 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-6 bg-gray-400 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-gray-400 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96" : "max-h-0"}`}>
        <div className="px-4 pb-4 pt-2 flex flex-col gap-1 border-t border-gray-800 bg-gray-950">
          <Link to="/rides" onClick={closeMenu}
            className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2.5 rounded-xl text-sm transition-colors">
            Trajets
          </Link>
          {user ? (
            <>
              <Link to="/me/rides/new" onClick={closeMenu}
                className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2.5 rounded-xl text-sm transition-colors">
                Publier un trajet
              </Link>
              <Link to="/me/reservations" onClick={closeMenu}
                className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2.5 rounded-xl text-sm transition-colors">
                Mes réservations
              </Link>
              <Link to="/me/rides" onClick={closeMenu}
                className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2.5 rounded-xl text-sm transition-colors">
                Mes trajets
              </Link>
              {user.role === "ADMIN" && (
                <Link to="/admin" onClick={closeMenu}
                  className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Dashboard Admin
                </Link>
              )}
              <Link to="/me/profile" onClick={closeMenu}
                className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2.5 rounded-xl text-sm transition-colors">
                  Mon profil
                </Link>
              <div className="border-t border-gray-800 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}
                className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2.5 rounded-xl text-sm transition-colors">
                Connexion
              </Link>
              <Link to="/register" onClick={closeMenu}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2.5 rounded-xl text-sm font-medium text-center transition-colors">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}