import {
  ClipboardList,
  Activity,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import { motion } from "framer-motion";

import MetricCard from "../components/dashboard/MetricCard";
import FunnelChart from "../components/dashboard/FunnelChart";
import RecentLeads from "../components/dashboard/RecentLeads";
import PipelineSummary from "../components/dashboard/PipelineSummary";

function formatDate() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const { auxiliary } = useDashboardService();
  const navigate = useNavigate(); // 👈 Inicialização do hook de navegação

  // 1. Estados de Navegação e Filtros
  const [activeTab, setActiveTab] = useState<TabType>("ATTENDANT");
  const [selectedAttendantId, setSelectedAttendantId] = useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  // 2. Estados para Listas (Selects)
  const [usersList, setUsersList] = useState<any[]>([]);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [loadingAux, setLoadingAux] = useState(false);

  // 3. Definição de Permissões
  const isManagerOrHigher = useMemo(() => 
    ["MANAGER", "GENERAL_MANAGER", "ADMIN"].includes(user?.role || ""), 
  [user]);
  
  const isGlobalOrHigher = useMemo(() => 
    ["GENERAL_MANAGER", "ADMIN"].includes(user?.role || ""), 
  [user]);

  // 4. Inicialização de Abas e IDs Padrão
  useEffect(() => {
    if (user) {
      setSelectedAttendantId(user.id);
      setSelectedTeamId(user.team_id || "");
      
      // Define a aba inicial baseada no maior nível de acesso
      if (isGlobalOrHigher) setActiveTab("GLOBAL");
      else if (isManagerOrHigher) setActiveTab("TEAM");
      else setActiveTab("ATTENDANT");
    }
  }, [user, isGlobalOrHigher, isManagerOrHigher]);

  // 5. Busca de Dados Auxiliares para Gestores
  useEffect(() => {
    if (!isManagerOrHigher) return;

    async function loadAuxData() {
      setLoadingAux(true);
      try {
        // Colocamos o ': any' para o TypeScript não reclamar das propriedades
        const usersData: any = await auxiliary.getUsers();
        
        const usersArray = Array.isArray(usersData) 
          ? usersData 
          : (usersData?.data || usersData?.users || []);
        
        setUsersList(usersArray);

        if (isGlobalOrHigher) {
          // Colocamos o ': any' aqui também
          const teamsData: any = await auxiliary.getTeams();
          
          const teamsArray = Array.isArray(teamsData) 
            ? teamsData 
            : (teamsData?.data || teamsData?.teams || []);
            
          setTeamsList(teamsArray);
        }
      } catch (err) {
        console.error("Erro ao carregar dados auxiliares do menu:", err);
      } finally {
        setLoadingAux(false);
      }
    }

    loadAuxData();
  }, [isManagerOrHigher, isGlobalOrHigher, auxiliary]);

  // 6. Verificação de segurança inicial
  if (!user) return <Forbidden onNavigate={navigate} />; // 👈 Corrigido: onNavigate adicionado

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060816] text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">

        {/* base gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563EB_0%,transparent_26%),radial-gradient(circle_at_bottom_right,#7C3AED_0%,transparent_22%),linear-gradient(135deg,#050816_0%,#081120_45%,#0B1730_100%)]" />

        {/* animated glow */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-120px] left-[-120px] w-[380px] h-[380px] rounded-full bg-blue-500/20 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-150px] right-[-120px] w-[350px] h-[350px] rounded-full bg-violet-500/20 blur-[120px]"
        />

        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        {/* floating dots */}
        <div className="absolute top-24 left-1/3 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <div className="absolute bottom-32 right-1/4 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 p-5 sm:p-7 lg:p-9">

        {/* TOP HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10"
        >

          {/* LEFT */}
          <div>

            {/* status badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-6 shadow-[0_0_25px_rgba(37,99,235,0.08)]">

              <div className="relative flex items-center justify-center">
                <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div className="relative w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              <span className="text-[12px] tracking-wide text-white/65">
                Sistema operacional • tempo real
              </span>
            </div>

            {/* title */}
            <h1 className="text-[32px] sm:text-[38px] font-semibold tracking-[-0.03em] leading-tight text-white">
              Dashboard comercial
            </h1>

            {/* subtitle */}
            <p className="mt-3 text-sm text-white/45 max-w-xl leading-relaxed">
              Visualize métricas, acompanhe negociações e monitore o
              desempenho da equipe em uma experiência moderna e dinâmica.
            </p>

            {/* date */}
            <div className="mt-5 flex items-center gap-3 text-white/35 text-sm">

              <div className="h-[1px] w-10 bg-white/10" />

              <span className="capitalize tracking-wide">
                {formatDate()}
              </span>
            </div>
          </div>

          {/* RIGHT INFO */}
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-6 py-5 shadow-[0_0_50px_rgba(37,99,235,0.08)]"
          >

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_35px_rgba(59,130,246,0.35)]">
                <TrendingUp size={24} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                  Receita mensal
                </p>

                <h2 className="text-2xl font-semibold mt-1">
                  R$ 6,1M
                </h2>

                <p className="text-emerald-400 text-sm mt-1">
                  +21% este mês
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          {[
            {
              title: "Total de Leads",
              value: "731",
              icon: <ClipboardList size={20} />,
              iconBg: "#2563EB",
              trend: 12,
              trendLabel: "vs mês anterior",
            },
            {
              title: "Leads Ativos",
              value: "489",
              icon: <Activity size={20} />,
              iconBg: "#8B5CF6",
              trend: 8,
              trendLabel: "negociação ativa",
            },
            {
              title: "Negócios Fechados",
              value: "38",
              icon: <CheckCircle2 size={20} />,
              iconBg: "#10B981",
              trend: -3,
              trendLabel: "vs mês anterior",
            },
            {
              title: "Valor Fechado",
              value: "R$ 6,1M",
              icon: <DollarSign size={20} />,
              iconBg: "#F97316",
              trend: 21,
              trendLabel: "receita mensal",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.08,
                duration: 0.45,
              }}
              whileHover={{
                y: -6,
              }}
              className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_50px_rgba(37,99,235,0.06)]"
            >

              {/* glow hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/10 to-cyan-400/5" />

              {/* border shine */}
              <div className="absolute inset-0 rounded-[30px] p-[1px] bg-gradient-to-br from-white/10 to-transparent opacity-50" />

              <div className="relative z-10">
                <MetricCard {...card} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-8">

          <motion.div
            whileHover={{ y: -4 }}
            className="xl:col-span-3 rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 shadow-[0_0_60px_rgba(37,99,235,0.06)]"
          >
            <FunnelChart />
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="xl:col-span-2 rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 shadow-[0_0_60px_rgba(37,99,235,0.06)]"
          >
            <PipelineSummary />
          </motion.div>
        </div>

        {/* RECENT LEADS */}
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 shadow-[0_0_60px_rgba(37,99,235,0.06)]"
        >
          <RecentLeads />
        </motion.div>
      </div>
    </div>
  );
}