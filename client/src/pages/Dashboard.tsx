import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Importação necessária para a navegação
import { useAuth } from "../hook/useAuth";
import { useDashboardService } from "../services/dashboardService";

// Importação das visões
import DashboardAttendant from "./DashboardAttendant";
import DashboardManager from "./DashboardManager";
import DashboardGeneralManager from "./DashboardGeneralManager";
import Forbidden from "./Forbidden";

// Tipagem para as abas disponíveis
type TabType = "GLOBAL" | "TEAM" | "ATTENDANT";

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
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      {/* ──────────────────────────────────────────────────────────────────
          HEADER & MENU DE NAVEGAÇÃO (TABS)
          ────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col pt-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Central de Resultados</h1>
              <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                Acesso: {user.role}
              </div>
            </div>

            {/* Menu de Abas Estilizado */}
            {isManagerOrHigher && (
              <div className="flex space-x-8 overflow-x-auto no-scrollbar">
                {isGlobalOrHigher && (
                  <TabButton 
                    label="Visão Global" 
                    active={activeTab === "GLOBAL"} 
                    onClick={() => setActiveTab("GLOBAL")} 
                  />
                )}
                <TabButton 
                  label="Visão da Equipe" 
                  active={activeTab === "TEAM"} 
                  onClick={() => setActiveTab("TEAM")} 
                />
                <TabButton 
                  label="Desempenho Individual" 
                  active={activeTab === "ATTENDANT"} 
                  onClick={() => setActiveTab("ATTENDANT")} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          BARRA DE SELEÇÃO DINÂMICA (SELECTS)
          ────────────────────────────────────────────────────────────────── */}
      {(activeTab === "TEAM" || activeTab === "ATTENDANT") && isManagerOrHigher && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2 text-gray-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span className="text-sm font-medium">Filtrar visão:</span>
            </div>

            {/* Seletor de Equipe (Apenas para Global/Admin na Aba de Equipe) */}
            {activeTab === "TEAM" && isGlobalOrHigher && (
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-50 outline-none transition-all"
              >
                <option value="">Selecione uma Equipe</option>
                {teamsList.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            )}

            {/* Seletor de Atendente (Para qualquer Gestor na Aba de Atendente) */}
            {activeTab === "ATTENDANT" && isManagerOrHigher && (
              <select
                value={selectedAttendantId}
                onChange={(e) => setSelectedAttendantId(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-50 outline-none transition-all"
              >
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.name} {u.id === user.id ? "(Eu)" : ""}</option>
                ))}
              </select>
            )}

            {loadingAux && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          ÁREA DE RENDERIZAÇÃO DO CONTEÚDO
          ────────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto py-6 animate-in fade-in duration-700">
        <div className="px-4 sm:px-6 lg:px-8">
          {activeTab === "GLOBAL" && isGlobalOrHigher && (
            <DashboardGeneralManager />
          )}

          {activeTab === "TEAM" && (
            isManagerOrHigher ? (
              selectedTeamId ? (
                <DashboardManager targetTeamId={selectedTeamId} />
              ) : (
                <EmptyState message="Selecione uma equipe para visualizar os dados consolidados." />
              )
            ) : <Forbidden onNavigate={navigate} /> // 👈 Corrigido: onNavigate adicionado
          )}

          {activeTab === "ATTENDANT" && (
            <DashboardAttendant targetAttendantId={selectedAttendantId} />
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Sub-componentes Auxiliares ──────────────────────────────────────────────

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        pb-4 px-1 text-sm font-semibold transition-all relative
        ${active ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}
      `}
    >
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full animate-in slide-in-from-left-full duration-300"></div>
      )}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-gray-300">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7"></path><line x1="3" y1="10" x2="21" y2="10"></line><path d="M16 19h6"></path><path d="M19 16v6"></path></svg>
      </div>
      <p className="text-gray-500 font-medium max-w-xs">{message}</p>
    </div>
  );
}