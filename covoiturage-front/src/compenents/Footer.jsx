import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#050810] border-t border-white/5 mt-auto relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 p-[1px] group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#050810] rounded-lg flex items-center justify-center">
                  <span className="text-sm">🌴</span>
                </div>
              </div>
              <span className="text-white font-black text-xl tracking-tight">
                Gasy<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Trip</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              La première plateforme de covoiturage à Madagascar. Partagez vos frais de route, voyagez confortablement et faites de nouvelles rencontres.
            </p>
          </div>

          {/* Liens Rapides */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Explorer</h3>
            <ul className="space-y-3">
              <li><Link to="/rides" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm font-medium">Rechercher un trajet</Link></li>
              <li><Link to="/me/rides/new" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm font-medium">Proposer un trajet</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm font-medium">S'inscrire</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Contact & Aide</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:randriatsilavina47@gmail.com" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm font-medium flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Nous contacter
                </a>
              </li>
              <li>
                <span className="text-gray-500 text-sm italic">FAQ & Aide (Bientôt)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs font-medium">
            © {year} GasyTrip. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
            <span>Fait avec</span>
            <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>à Madagascar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}