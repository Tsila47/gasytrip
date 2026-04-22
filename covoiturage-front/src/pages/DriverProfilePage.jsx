import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";

function Avatar({ name, photoUrl }) {
  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/30"
      />
    );
  }

  return (
    <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 text-indigo-300 flex items-center justify-center text-2xl font-bold">
      {initials}
    </div>
  );
}

function getDriverBadges(stats) {
  const ridesCount = Number(stats?.rides_count) || 0;
  const ratingsCount = Number(stats?.ratings_count) || 0;
  const averageRating = stats?.average_rating !== null ? Number(stats?.average_rating) : null;
  const badges = [];

  if (ridesCount < 3) {
    badges.push({
      key: "new",
      label: "Nouveau conducteur",
      className: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    });
  }

  if (ridesCount >= 3) {
    badges.push({
      key: "regular",
      label: "Conducteur régulier",
      className: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    });
  }

  if (ridesCount >= 10 && ratingsCount >= 5 && averageRating !== null && averageRating >= 4.5) {
    badges.push({
      key: "top",
      label: "Top conducteur",
      className: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    });
  }

  return badges;
}

export default function DriverProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    api
      .get(`/users/${id}/public`)
      .then(({ data }) => {
        if (mounted) {
          setProfile(data);
          setError("");
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.response?.data?.message || "Profil conducteur introuvable.");
          setProfile(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const badges = profile ? getDriverBadges(profile.stats) : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/rides" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-6">
          ← Retour aux trajets
        </Link>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!profile && !error && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 animate-pulse h-56" />
        )}

        {profile && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <Avatar name={profile.user.name} photoUrl={profile.user.photo_url} />
                <div>
                  <h1 className="text-xl font-bold">{profile.user.name}</h1>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.user.is_driver && (
                      <span className="inline-block bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
                        Conducteur
                      </span>
                    )}
                    {badges.map((badge) => (
                      <span
                        key={badge.key}
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                  {profile.user.member_since && (
                    <p className="text-gray-500 text-sm mt-2">
                      Membre depuis{" "}
                      {new Date(profile.user.member_since).toLocaleDateString("fr-MG", {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Trajets publiés</p>
                <p className="text-indigo-400 text-3xl font-bold">{profile.stats.rides_count}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Passagers transportés</p>
                <p className="text-emerald-400 text-3xl font-bold">{profile.stats.passengers_count}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Note moyenne</p>
                <p className="text-amber-400 text-3xl font-bold">
                  {profile.stats.average_rating !== null ? `${profile.stats.average_rating.toFixed(1)} ⭐` : "N/A"}
                </p>
                {profile.stats.ratings_count > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    {profile.stats.ratings_count} avis
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-white font-semibold">Derniers trajets publiés</h2>
                <Link
                  to={`/rides?driver_id=${profile.user.id}`}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  Voir ses trajets
                </Link>
              </div>

              {profile.recent_rides?.length > 0 ? (
                <div className="space-y-3">
                  {profile.recent_rides.map((ride) => (
                    <Link
                      key={ride.id}
                      to={`/rides/${ride.id}`}
                      className="block border border-gray-800 hover:border-indigo-500/40 rounded-xl px-4 py-3 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-white font-medium">
                            {ride.departure_city} <span className="text-indigo-400">→</span> {ride.arrival_city}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {new Date(ride.departure_datetime).toLocaleString("fr-MG")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-indigo-400 font-semibold text-sm">
                            {Number(ride.price).toLocaleString()} Ar
                          </p>
                          <p className="text-gray-500 text-xs">
                            {ride.seats_available}/{ride.seats_total} places
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucun trajet publié pour le moment.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
