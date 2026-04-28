import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import { getSocket } from "../services/socket.js";

function formatTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("fr-MG", { hour: "2-digit", minute: "2-digit" });
}
function formatDay(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-MG", { weekday: "short", day: "numeric", month: "short" });
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeRideId, setActiveRideId] = useState(params.get("ride") ? Number(params.get("ride")) : null);
  const [activeUserId, setActiveUserId] = useState(params.get("with") ? Number(params.get("with")) : null);

  const [messages, setMessages] = useState([]);
  const [rideInfo, setRideInfo] = useState(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const scrollRef = useRef(null);

  // Charger les conversations (sans polling)
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data } = await api.get("/messages/conversations");
        if (!mounted) return;
        setConversations(data.conversations || []);
      } catch (err) { /* noop */ }
      finally { if (mounted) setLoadingList(false); }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Si on arrive avec ?ride=X&with=Y et qu'aucune conversation n'existe encore,
  // on tente d'afficher l'en-tête à partir des contacts du trajet.
  useEffect(() => {
    async function bootstrapThread() {
      if (!activeRideId || !activeUserId) return;
      try {
        const { data } = await api.get(`/messages/ride/${activeRideId}/contacts`);
        setRideInfo(data.ride || null);
        const list = Array.isArray(data.contacts) ? data.contacts : [data.contacts].filter(Boolean);
        const target = list.find((c) => Number(c.id) === Number(activeUserId));
        if (target) setOtherUserName(target.name);
      } catch (err) { /* noop */ }
    }
    bootstrapThread();
  }, [activeRideId, activeUserId]);

  // Charger les messages d'une conversation (sans polling)
  useEffect(() => {
    if (!activeRideId || !activeUserId) return;
    let mounted = true;
    async function load(initial = false) {
      if (initial) setLoadingThread(true);
      try {
        const { data } = await api.get(`/messages/${activeRideId}/${activeUserId}`);
        if (!mounted) return;
        setMessages(data.messages || []);
        if (data.ride) {
          setRideInfo(data.ride);
          if (data.ride.other_user_name) setOtherUserName(data.ride.other_user_name);
        }
        // Marquer comme lus
        api.patch(`/messages/${activeRideId}/${activeUserId}/read`).catch(() => {});
      } catch (err) { /* noop */ }
      finally { if (mounted && initial) setLoadingThread(false); }
    }
    load(true);
    return () => { mounted = false; };
  }, [activeRideId, activeUserId]);

  // Temps réel: écouter les nouveaux messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    function onNewMessage(payload) {
      const msg = payload?.message;
      if (!msg?.id) return;

      const myId = Number(user.id);
      const senderId = Number(msg.sender_id);
      const receiverId = Number(msg.receiver_id);
      const rideId = Number(msg.ride_id);
      const otherId = senderId === myId ? receiverId : senderId;

      // Mettre à jour la liste des conversations (dernier message + non lus)
      setConversations((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        const idx = next.findIndex(
          (c) => Number(c.ride_id) === rideId && Number(c.other_user_id) === otherId
        );
        const isActive = Number(activeRideId) === rideId && Number(activeUserId) === otherId;
        const incUnread = receiverId === myId && !isActive;

        if (idx >= 0) {
          const cur = next[idx];
          next[idx] = {
            ...cur,
            last_message: msg.content,
            last_at: msg.created_at,
            unread_count: Math.max(0, Number(cur.unread_count || 0) + (incUnread ? 1 : 0)),
          };
          // Remonter en haut
          const [moved] = next.splice(idx, 1);
          next.unshift(moved);
          return next;
        }
        return next;
      });

      // Si le message concerne le thread actif, l'ajouter et marquer comme lu si besoin
      if (Number(activeRideId) === rideId && Number(activeUserId) === otherId) {
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
          return [...prev, msg];
        });
        if (receiverId === myId) {
          api.patch(`/messages/${rideId}/${otherId}/read`).catch(() => {});
        }
      }
    }

    socket.on("new_message", onNewMessage);
    return () => socket.off("new_message", onNewMessage);
  }, [user, activeRideId, activeUserId]);

  // Auto-scroll en bas
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  function selectConversation(rideId, userId, name) {
    setActiveRideId(rideId);
    setActiveUserId(userId);
    setOtherUserName(name || "");
    setMessages([]);
    setParams({ ride: String(rideId), with: String(userId) });
  }

  async function handleSend(e) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !activeRideId || !activeUserId || sending) return;
    setSending(true);
    const optimistic = {
      id: `tmp-${Date.now()}`,
      ride_id: activeRideId,
      sender_id: user.id,
      receiver_id: activeUserId,
      content,
      is_read: 0,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    try {
      const { data } = await api.post(`/messages/${activeRideId}/${activeUserId}`, { content });
      const saved = data?.message;
      if (saved?.id) {
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)));
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(content);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight">
            Vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Messages</span>
          </h1>
          <p className="text-gray-400 font-medium mt-1">Discutez avec vos conducteurs et passagers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[70vh] min-h-[500px]">

          {/* Liste des conversations */}
          <aside className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="font-bold text-white">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingList && (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
              )}
              {!loadingList && conversations.length === 0 && (
                <div className="p-6 text-center text-gray-400 text-sm">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-2xl">💬</div>
                  Aucune conversation. Lancez-en une depuis vos réservations ou trajets.
                </div>
              )}
              {!loadingList && conversations.map((c) => {
                const isActive = Number(c.ride_id) === Number(activeRideId) && Number(c.other_user_id) === Number(activeUserId);
                return (
                  <button
                    key={`${c.ride_id}-${c.other_user_id}`}
                    onClick={() => selectConversation(c.ride_id, c.other_user_id, c.other_user_name)}
                    className={`w-full text-left px-5 py-4 border-b border-white/5 transition-colors flex items-start gap-3 ${
                      isActive ? "bg-indigo-500/15" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                      {c.other_user_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-white text-sm truncate">{c.other_user_name}</p>
                        {c.unread_count > 0 && (
                          <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">{c.unread_count}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-indigo-300/80 truncate">
                        {c.departure_city} → {c.arrival_city}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{c.last_message}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Thread */}
          <section className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col">
            {!activeRideId || !activeUserId ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-center px-8">
                <div>
                  <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-3xl">✉️</div>
                  <p className="font-bold text-white">Sélectionnez une conversation</p>
                  <p className="text-sm mt-1">ou démarrez-en une depuis "Mes réservations" ou "Mes trajets".</p>
                </div>
              </div>
            ) : (
              <>
                <header className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                  <button onClick={() => navigate(-1)} className="md:hidden text-gray-400 hover:text-white p-1">←</button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {otherUserName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{otherUserName || "Conversation"}</p>
                    {rideInfo && (
                      <p className="text-xs text-indigo-300/80 truncate">
                        {rideInfo.departure_city} → {rideInfo.arrival_city} · {formatDay(rideInfo.departure_datetime)}
                      </p>
                    )}
                  </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-3">
                  {loadingThread && (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-2xl animate-pulse w-2/3" />)}
                    </div>
                  )}
                  {!loadingThread && messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-12">Aucun message. Écrivez le premier !</div>
                  )}
                  {messages.map((m, idx) => {
                    const mine = Number(m.sender_id) === Number(user.id);
                    const prev = messages[idx - 1];
                    const showDay = !prev || new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString();
                    return (
                      <div key={m.id}>
                        {showDay && (
                          <div className="text-center my-4">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                              {formatDay(m.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                            mine
                              ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md"
                              : "bg-white/10 text-white rounded-bl-md"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                            <p className={`text-[10px] mt-1 text-right ${mine ? "text-indigo-100/70" : "text-gray-400"}`}>
                              {formatTime(m.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSend} className="border-t border-white/5 p-3 flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Écrire un message…"
                    rows={1}
                    className="flex-1 resize-none bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none rounded-2xl px-4 py-2.5 text-sm text-white placeholder-gray-500 max-h-32"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/25"
                  >
                    Envoyer
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}