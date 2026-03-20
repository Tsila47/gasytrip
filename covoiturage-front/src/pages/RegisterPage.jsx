import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Nom obligatoire.";
    if (!form.email.trim()) e.email = "Email obligatoire.";
    if (!form.password.trim()) e.password = "Mot de passe obligatoire.";
    else if (form.password.length < 6) e.password = "6 caractères minimum.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token);
      navigate("/me/reservations");
    } catch (err) {
      setErrors({ form: err.response?.data?.message || "Erreur lors de l'inscription." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🌴</span>
          <h1 className="text-2xl font-bold text-white mt-2">
            Gasy<span className="text-indigo-400">Trip</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Crée ton compte gratuitement</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {errors.form && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Nom complet", name: "name", type: "text", placeholder: "Rakoto Jean" },
              { label: "Email", name: "email", type: "email", placeholder: "toi@exemple.mg" },
              { label: "Téléphone (optionnel)", name: "phone", type: "tel", placeholder: "+261 34 00 000 00" },
              { label: "Mot de passe", name: "password", type: "password", placeholder: "6 caractères minimum" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm mt-2"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}