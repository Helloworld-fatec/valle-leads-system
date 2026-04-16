import { Search, Bell, ChevronDown } from "lucide-react";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Visão geral do sistema" },
  "/leads": { title: "Leads", subtitle: "Gerenciamento de leads" },
  "/funil": { title: "Funil de Vendas", subtitle: "Pipeline por etapas" },
  "/usuarios": { title: "Usuários", subtitle: "Controle de acesso da equipe" },
  "/perfil": { title: "Meu Perfil", subtitle: "Suas informações e preferências" },
};

interface HeaderProps {
  currentPath: string;
}

export default function Header({ currentPath }: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const page = pageTitles[currentPath] ?? { title: "Valle Leads", subtitle: "" };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
      {/* Left: breadcrumb/title */}
      <div className="hidden sm:block">
        <h2 className="text-sm font-bold text-gray-900 leading-tight">{page.title}</h2>
        <p className="text-xs text-gray-400 leading-tight">{page.subtitle}</p>
      </div>

      {/* Center: search */}
      <div className="flex-1 max-w-xs mx-4 sm:mx-6">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-8 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all"
          />
        </div>
      </div>

      {/* Right: notification + user */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
            SM
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-tight">
              {greeting}, Suelen
            </p>
            <p className="text-[10px] text-gray-400 leading-tight capitalize">{dateStr}</p>
          </div>
          <ChevronDown size={12} className="text-gray-400 hidden md:block" />
        </button>
      </div>
    </header>
  );
}
