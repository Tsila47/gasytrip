import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const { data } = await api.get("/notifications");
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  function handleLogout() {
    logout();
    navigate("/");
    setMenuOpen(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const linkClass = (path) =>
    `relative text-sm font-medium transition-colors group px-2 py-1 ${
      location.pathname === path
        ? "text-white"
        : "text-gray-400 hover:text-white"
    }`;

  const ActiveIndicator = ({ path }) => (
    <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-transform origin-left ${
      location.pathname === path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
    }`}></span>
  );

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-[#0a0f1c]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20 py-2" 
        : "bg-transparent py-4"
    }`}>
      <nav className="max-w-6xl mx-auto px-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-[1px] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0a0f1c] rounded-xl flex items-center justify-center">
              <span className="text-xl">🌴</span>
            </div>
          </div>
          <span className="text-white font-black text-xl tracking-tight">
            Gasy<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Trip</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 bg-gray-900/50 backdrop-blur-md border border-white/5 px-6 py-2 rounded-full">
          <Link to="/rides" className={linkClass("/rides")}>
            Trajets
            <ActiveIndicator path="/rides" />
          </Link>
          {user && (
            <>
              <Link to="/me/reservations" className={linkClass("/me/reservations")}>
                Réservations
                <ActiveIndicator path="/me/reservations" />
              </Link>
              <Link to="/me/rides" className={linkClass("/me/rides")}>
                Mes trajets
                <ActiveIndicator path="/me/rides" />
              </Link>
              {user.role === "ADMIN" && (
                <Link to="/admin" className={linkClass("/admin")}>
                  <span className="text-indigo-400">Admin</span>
                  <ActiveIndicator path="/admin" />
                </Link>
              )}
            </>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
             <>
             <Link
               to="/me/rides/new"
               className="flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors px-2"
             >
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
               Publier
             </Link>
             <div className="h-6 w-px bg-white/10 mx-2"></div>
             <Link to="/me/notifications" className="relative p-2 text-gray-400 hover:text-indigo-400 transition-colors" title="Notifications">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
               {unreadCount > 0 && (
                 <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0f1c] box-content"></span>
               )}
             </Link>
             <Link to="/me/messages" className="relative p-2 text-gray-400 hover:text-indigo-400 transition-colors" title="Messages">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 21l1.8-5A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </Link>
             <Link to="/me/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
               <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                 {user.username?.charAt(0).toUpperCase() || "U"}
               </div>
             </Link>
             <button
               onClick={handleLogout}
               className="text-gray-400 hover:text-red-400 p-2 transition-colors"
               title="Déconnexion"
             >
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
             </button>
           </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-white hover:text-indigo-400 transition-colors">Connexion</Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2 rounded-full transition-all duration-300 font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
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
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none bg-white/5 rounded-full"
          aria-label="Menu"
        >
          <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[500px]" : "max-h-0"} bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl`}>
        <div className="px-4 pb-6 pt-4 flex flex-col gap-2">
          <Link to="/rides" onClick={closeMenu}
            className="text-white hover:bg-white/5 px-4 py-3 rounded-xl text-base font-medium transition-colors">
            Rechercher un trajet
          </Link>
          {user ? (
            <>
              <Link to="/me/rides/new" onClick={closeMenu}
                className="text-indigo-400 hover:bg-white/5 px-4 py-3 rounded-xl text-base font-bold transition-colors flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                Publier un trajet
              </Link>
              <Link to="/me/notifications" onClick={closeMenu}
                className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl text-base transition-colors flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </Link>
              <Link to="/me/messages" onClick={closeMenu}
                className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl text-base transition-colors">
                Messages
              </Link>
              <Link to="/me/reservations" onClick={closeMenu}
                className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl text-base transition-colors">
                Mes réservations
              </Link>
              <Link to="/me/rides" onClick={closeMenu}
                className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl text-base transition-colors">
                Mes trajets
              </Link>
              {user.role === "ADMIN" && (
                <Link to="/admin" onClick={closeMenu}
                  className="text-indigo-400 bg-indigo-500/10 px-4 py-3 rounded-xl text-base font-medium transition-colors">
                  Dashboard Admin
                </Link>
              )}
              <Link to="/me/profile" onClick={closeMenu}
                className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl text-base transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  Mon profil
                </Link>
              <div className="border-t border-white/10 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-xl text-base font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link to="/login" onClick={closeMenu}
                className="text-white bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl text-base font-medium transition-colors text-center">
                Connexion
              </Link>
              <Link to="/register" onClick={closeMenu}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-base font-bold text-center transition-colors">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}