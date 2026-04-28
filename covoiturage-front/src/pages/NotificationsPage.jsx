import { useEffect, useState } from "react";
import api from "../services/api.js";

function getNotificationIcon(type) {
  switch (type) {
    case 'BOOKING_NEW':
      return { icon: '🤝', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' };
    case 'BOOKING_CANCELLED':
    case 'RIDE_CANCELLED':
      return { icon: '⚠️', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    default:
      return { icon: '🔔', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30' };
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
    } catch (err) {
      setError("Impossible de charger vos notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markAsRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  }

  async function markAllAsRead() {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  }

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-12 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Notifications</span>
            </h1>
            <p className="text-gray-400 font-medium">Toutes les alertes concernant vos trajets et réservations.</p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-sm font-bold px-5 py-2.5 rounded-xl border border-indigo-500/30 transition-colors"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl px-6 py-4 mb-8 shadow-xl font-bold">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 animate-pulse h-24" />
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-20 bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl">
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔕</span>
            </div>
            <p className="text-white text-xl font-bold mb-2">Vous n'avez aucune notification</p>
            <p className="text-gray-400">Nous vous tiendrons informé des événements importants ici.</p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map(n => {
              const { icon, bg, border } = getNotificationIcon(n.type);
              const isUnread = n.is_read === 0;

              return (
                <div 
                  key={n.id} 
                  className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 group ${
                    isUnread 
                      ? "bg-gray-800/80 backdrop-blur-xl border border-indigo-500/50 shadow-lg shadow-indigo-500/10" 
                      : "bg-gray-900/40 backdrop-blur-xl border border-white/5 opacity-70 hover:opacity-100"
                  }`}
                >
                  {isUnread && (
                    <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500 rounded-r-3xl"></div>
                  )}

                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl ${bg} border ${border} flex items-center justify-center text-xl shrink-0`}>
                      {icon}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`text-sm ${isUnread ? "text-white font-bold" : "text-gray-300 font-medium"} leading-relaxed`}>
                        {n.message}
                      </p>
                      <p className="text-gray-500 text-xs mt-2 font-medium">
                        {new Date(n.created_at).toLocaleString("fr-MG", { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}
                      </p>
                    </div>

                    {isUnread && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="opacity-0 group-hover:opacity-100 shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-indigo-500/40 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white transition-all"
                      >
                        Lu ✓
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
