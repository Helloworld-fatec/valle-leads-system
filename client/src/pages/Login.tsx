// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import { loginRequest } from "../services/loginService";

export default function Login() {
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.background = "#050816";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  async function handleSubmit() {
    setError(null);

    if (!form.email || !form.password) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const { user, accessToken, refreshToken } = await loginRequest({
        email: form.email,
        password: form.password,
      });

      // Persiste no contexto + localStorage (AuthProvider cuida disso)
      login(user, accessToken, refreshToken);

      // O redirect é automático — PublicOnlyRoute detecta isAuthenticated=true
      // e redireciona para /dashboard via Navigate
    } catch (err: any) {
      setError(err?.message ?? "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="min-h-screen overflow-hidden flex bg-[#050816] relative">

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563EB_0%,transparent_30%),radial-gradient(circle_at_bottom_right,#DC2626_0%,transparent_25%),linear-gradient(135deg,#050816_0%,#081127_45%,#0B1431_100%)]" />
        <div className="absolute -top-37.5 -left-30 w-112.5 h-112.5 rounded-full bg-blue-500/25 blur-[140px] animate-pulse" />
        <div className="absolute -bottom-45 -right-30 w-112.5 h-112.5 rounded-full bg-red-500/20 blur-[140px] animate-pulse" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-between px-16 py-14">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-4"
        >
          <img
            src="/logo.jpeg"
            alt="Valle Leads"
            className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.35)]"
          />
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight">Az - Sistema de Gestão de Leads</h1>
            <p className="text-blue-300 text-sm tracking-[0.30em] uppercase">1000 Valle Multimarcas</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/70">Plataforma online em tempo real</span>
          </div>

          <h1 className="text-6xl font-black leading-none tracking-tight text-white">
            Transformando
            <br />
            <span className="bg-linear-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
              oportunidades
            </span>
            <br />
            em resultados.
          </h1>

          <p className="mt-8 text-lg leading-relaxed text-white/60 max-w-lg">
            Sistema de controle de leads, acompanhamento de negociações e visualização de métricas com uma experiência
            moderna, rápida e visualmente agradável.
          </p>
        </motion.div>

        <div className="flex items-center justify-between">
          <p className="text-white/30 text-sm">© {new Date().getFullYear()} Az - Sistema de Gestão de Leads - desenvolvido por Hello World Software House</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">

        {/* MOBILE LOGO */}
        <div className="absolute top-8 left-8 flex items-center gap-3 lg:hidden">
          <img
            src="/logo.jpeg"
            alt="Valle Leads"
            className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.35)]"
          />
          <div>
            <h1 className="text-white font-black text-xl">Valle</h1>
            <p className="text-blue-300 text-xs uppercase tracking-[0.25em]">Leads</p>
          </div>
        </div>

        {/* FORM CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md relative"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-110" />

          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/6 backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(37,99,235,0.15)]">
            <div className="absolute top-0 left-0 w-full h-0.75 bg-linear-to-r from-blue-500 via-cyan-400 to-red-500" />

            <div className="mb-8">
              <h2 className="text-4xl font-black text-white tracking-tight">Entrar</h2>
              <p className="text-white/50 mt-2">Continue para acessar sua plataforma.</p>
            </div>

            {/* ERROR */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {/* EMAIL */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-white/70 mb-2">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="seu@email.com"
                className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none transition-all focus:border-blue-400 focus:bg-white/8 focus:ring-4 focus:ring-blue-500/10 hover:border-blue-400/40"
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">Senha</label>
                <button
                  type="button"
                  className="text-xs text-blue-300 hover:text-cyan-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className="w-full h-14 px-5 pr-14 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none transition-all focus:border-blue-400 focus:bg-white/8 focus:ring-4 focus:ring-blue-500/10 hover:border-blue-400/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="group relative w-full h-14 overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-blue-500 to-cyan-400 text-white font-bold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10" />
              {loading ? (
                <div className="w-6 h-6 mx-auto rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <div className="relative flex items-center justify-center gap-2">
                  <LogIn size={20} />
                  Entrar na plataforma
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </button>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Plataforma operacional estável
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}