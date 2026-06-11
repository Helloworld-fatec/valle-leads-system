import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":    { title: "Dashboard",  subtitle: "Visão geral da plataforma" },
  "/leads":        { title: "Leads",      subtitle: "Gerenciamento inteligente" },
  "/funil":        { title: "Funil",      subtitle: "Pipeline de conversão" },
  "/usuarios":     { title: "Usuários",   subtitle: "Equipe e permissões" },
  "/perfil":       { title: "Perfil",     subtitle: "Configurações da conta" },
  "/manager/leads":{ title: "Leads",      subtitle: "Visão do gestor" },
  "/teams":        { title: "Times",      subtitle: "Gestão de equipes" },
  "/stores":       { title: "Lojas",      subtitle: "Gestão de lojas" },
  "/gm/leads":     { title: "Leads GM",   subtitle: "Visão geral de leads" },
};

interface HeaderProps {
  currentPath: string;
}

export default function Header({ currentPath }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const page = pageTitles[currentPath] ?? { title: "Valle Leads", subtitle: "Sistema" };

  // Iniciais do nome do usuário
  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "??";

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  }

  return (
    <header
      className="sticky top-0 z-30 h-22 border-b border-white/5 backdrop-blur-2xl overflow-visible"
      style={{
        background:
          "linear-gradient(180deg, rgba(8,17,39,0.92) 0%, rgba(11,20,49,0.82) 100%)",
      }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-30 left-[15%] w-[320px] h-80 rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="absolute -top-35 right-[10%] w-65 h-65 rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.03),transparent,rgba(6,182,212,0.03))]" />
      </div>

      <div className="relative h-full px-6 lg:px-10 flex items-center justify-between gap-6">

        {/* LEFT — título da página */}
        <div className="flex items-center gap-5 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70 font-medium">
                1000 Valle Platform
              </span>
            </div>
            <h1 className="text-[21px] font-semibold tracking-tight text-white leading-none">
              {page.title}
            </h1>
            <p className="text-[12px] text-white/35 mt-2">{page.subtitle}</p>
          </div>
        </div>

        {/* RIGHT — usuário com dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-[#0B1736]/80 backdrop-blur-xl px-3 py-2 transition-all duration-300 hover:bg-[#10204D] hover:border-white/10"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-blue-500/40 blur-md opacity-0 transition-all duration-300 group-hover:opacity-100" />
              <div className="relative w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 via-blue-400 to-cyan-400 flex items-center justify-center text-white text-sm font-semibold shadow-[0_0_25px_rgba(37,99,235,0.35)]">
                {initials}
              </div>
            </div>

            {/* Nome + data */}
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-white leading-none">
                {user?.name ?? "Usuário"}
              </p>
              <p className="text-[11px] text-white/30 mt-1 capitalize">{dateStr}</p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden lg:block text-white/25 transition-all duration-300 group-hover:text-white/60 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 bg-[#0B1736]/95 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50">

              {/* Info do usuário */}
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name ?? "Usuário"}
                </p>
                <p className="text-xs text-white/35 mt-0.5 truncate">
                  {user?.email ?? ""}
                </p>
              </div>

              {/* Perfil */}
              <button
                onClick={() => { setDropdownOpen(false); navigate("/perfil"); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <UserCircle size={16} className="shrink-0" />
                Meu Perfil
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 border-t border-white/5"
              >
                <LogOut size={16} className="shrink-0" />
                Sair da plataforma
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}