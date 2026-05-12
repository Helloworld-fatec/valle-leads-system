import {
  Search,
  Bell,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const pageTitles: Record<
  string,
  {
    title: string;
    subtitle: string;
  }
> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Visão geral da plataforma",
  },

  "/leads": {
    title: "Leads",
    subtitle: "Gerenciamento inteligente",
  },

  "/funil": {
    title: "Funil",
    subtitle: "Pipeline de conversão",
  },

  "/usuarios": {
    title: "Usuários",
    subtitle: "Equipe e permissões",
  },

  "/perfil": {
    title: "Perfil",
    subtitle: "Configurações da conta",
  },
};

interface HeaderProps {
  currentPath: string;
}

export default function Header({
  currentPath,
}: HeaderProps) {

  const now = new Date();

  const dateStr = now.toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );

  const page =
    pageTitles[currentPath] ?? {
      title: "Valle Leads",
      subtitle: "Sistema",
    };

  return (
    <header
      className="
        sticky
        top-0
        z-30
        h-[88px]
        border-b
        border-white/5
        backdrop-blur-2xl
        overflow-hidden
      "
      style={{
        background:
          "linear-gradient(180deg, rgba(8,17,39,0.92) 0%, rgba(11,20,49,0.82) 100%)",
      }}
    >

      {/* background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* blue glow */}
        <div className="absolute top-[-120px] left-[15%] w-[320px] h-[320px] rounded-full bg-blue-500/15 blur-[120px]" />

        {/* cyan glow */}
        <div className="absolute top-[-140px] right-[10%] w-[260px] h-[260px] rounded-full bg-cyan-400/10 blur-[120px]" />

        {/* subtle gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.03),transparent,rgba(6,182,212,0.03))]" />

      </div>

      <div className="relative h-full px-6 lg:px-10 flex items-center justify-between gap-6">

        {/* LEFT */}
        <div className="flex items-center gap-5 min-w-0">

          <div className="min-w-0">

            {/* top label */}
            <div className="flex items-center gap-2 mb-2">

              <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />

              <span className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70 font-medium">
                Valle Platform
              </span>
            </div>

            {/* title */}
            <h1 className="text-[21px] font-semibold tracking-tight text-white leading-none">
              {page.title}
            </h1>

            {/* subtitle */}
            <p className="text-[12px] text-white/35 mt-2">
              {page.subtitle}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="hidden md:flex flex-1 justify-center px-4">

          <div className="relative w-full max-w-xl group">

            {/* glow */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500/0 blur-2xl transition-all duration-500 group-focus-within:bg-blue-500/10" />

            <Search
              size={16}
              className="
                absolute
                left-5
                top-1/2
                -translate-y-1/2
                text-white/25
                transition-all
                duration-300
                group-focus-within:text-cyan-300
              "
            />

            <input
              type="text"
              placeholder="Buscar leads, usuários, negociações..."
              className="
                w-full
                h-12
                rounded-2xl
                border
                border-white/5
                bg-[#0B1736]/80
                backdrop-blur-xl
                pl-12
                pr-5
                text-sm
                text-white
                placeholder:text-white/25
                outline-none
                transition-all
                duration-300
                focus:border-cyan-400/20
                focus:bg-[#0E1C44]
                focus:ring-4
                focus:ring-cyan-400/5
                hover:border-white/10
              "
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* notifications */}
          <button
            className="
              relative
              w-11
              h-11
              rounded-2xl
              border
              border-white/5
              bg-[#0B1736]/80
              backdrop-blur-xl
              flex
              items-center
              justify-center
              text-white/50
              transition-all
              duration-300
              hover:text-white
              hover:bg-[#10204D]
              hover:border-cyan-400/10
            "
          >

            <Bell size={18} />

            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
          </button>

          {/* user */}
          <button
            className="
              group
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/5
              bg-[#0B1736]/80
              backdrop-blur-xl
              px-3
              py-2
              transition-all
              duration-300
              hover:bg-[#10204D]
              hover:border-white/10
            "
          >

            {/* avatar */}
            <div className="relative">

              {/* glow */}
              <div className="
                absolute
                inset-0
                rounded-xl
                bg-blue-500/40
                blur-md
                opacity-0
                transition-all
                duration-300
                group-hover:opacity-100
              " />

              {/* avatar */}
              <div
                className="
                  relative
                  w-10
                  h-10
                  rounded-xl
                  bg-gradient-to-br
                  from-blue-500
                  via-blue-400
                  to-cyan-400
                  flex
                  items-center
                  justify-center
                  text-white
                  text-sm
                  font-semibold
                  shadow-[0_0_25px_rgba(37,99,235,0.35)]
                "
              >
                SM
              </div>
            </div>

            {/* info */}
            <div className="hidden lg:block text-left">

              <p className="text-sm font-medium text-white leading-none">
                Suelen Martins
              </p>

              <p className="text-[11px] text-white/30 mt-1 capitalize">
                {dateStr}
              </p>
            </div>

            <ChevronDown
              size={15}
              className="
                hidden
                lg:block
                text-white/25
                transition-all
                duration-300
                group-hover:text-white/60
                group-hover:translate-y-[1px]
              "
            />
          </button>
        </div>
      </div>
    </header>
  );
}