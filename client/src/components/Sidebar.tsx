import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Handshake,
  Settings,
  X,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hook/useAuth";
import type { UserRole } from "../contexts/AuthContext";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  allowedRoles?: UserRole[]; // undefined = visível para todos
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Negociações",
    icon: <Handshake size={18} />,
    path: "/funil",
  },
  {
    label: "Leads",
    icon: <ClipboardList size={18} />,
    path: "/leads",
  },
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/dashboard",
  },
  {
    label: "Usuários",
    icon: <Users size={18} />,
    path: "/usuarios",
    allowedRoles: ["GENERAL_MANAGER", "ADMIN"],
  },
  {
    label: "Config",
    icon: <Settings size={18} />,
    path: "/config",
    allowedRoles: ["MANAGER", "GENERAL_MANAGER", "ADMIN"],
  },
];

// ─── Conteúdo interno reutilizado em desktop e mobile ────────────────────────
function SidebarContent({
  currentPath,
  onNavigate,
  collapsed,
  onCollapse,
  onClose,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed: boolean;
  onCollapse?: () => void;
  onClose?: () => void;
}) {
  const { user } = useAuth();
  const role = user?.role;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.allowedRoles || (role && item.allowedRoles.includes(role))
  );

  return (
    <div className="relative z-10 flex flex-col h-full px-4 py-5">

      {/* LOGO */}
      <motion.div layout className={`flex items-center ${collapsed ? "justify-center" : "gap-4"}`}>
        <motion.div whileHover={{ scale: 1.05 }} className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl" />
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl overflow-hidden shadow-[0_0_25px_rgba(37,99,235,0.25)]">
            <img src="/logo.jpeg" alt="Valle Leads" className="w-11 h-11 object-contain" />
          </div>
        </motion.div>

        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden flex-1">
            <h1 className="text-white font-semibold text-[20px] leading-none tracking-tight">Valle</h1>
            <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-blue-300">Leads System</p>
          </motion.div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </motion.div>

      {/* DIVIDER */}
      <div className="h-px bg-white/10 my-6" />

      {/* MENU */}
      <div className="flex-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[11px] uppercase tracking-[0.30em] text-white/25 px-3 mb-4">
            Navegação
          </p>
        )}

        <nav className="space-y-2">
          {visibleItems.map((item, index) => {
            const isActive = currentPath === item.path;
            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ x: collapsed ? 0 : 4 }}
                onClick={() => { onNavigate(item.path); onClose?.(); }}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center w-full overflow-hidden rounded-2xl transition-all duration-300 ${
                  collapsed ? "justify-center h-14" : "gap-4 px-4 h-14"
                } ${
                  isActive
                    ? "bg-linear-to-r from-blue-500/20 to-cyan-400/10 border border-blue-400/20 shadow-[0_0_25px_rgba(37,99,235,0.15)]"
                    : "hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-cyan-300 to-blue-500 rounded-r-full" />
                )}

                <div className={`relative flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isActive ? "text-cyan-300" : "text-white/45 group-hover:text-white"
                }`}>
                  {item.icon}
                </div>

                {!collapsed && (
                  <>
                    <span className={`text-sm transition-all ${
                      isActive ? "text-white font-medium" : "text-white/60 group-hover:text-white"
                    }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div layoutId="active-dot" className="ml-auto w-2 h-2 rounded-full bg-cyan-300" />
                    )}
                  </>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* BOTÃO RECOLHER — desktop */}
      {onCollapse && (
        <button
          onClick={onCollapse}
          className={`mt-5 group flex items-center rounded-2xl border border-white/5 bg-white/3 hover:bg-white/5 transition-all duration-300 ${
            collapsed ? "justify-center w-full h-13" : "gap-3 px-4 w-full h-13"
          }`}
        >
          {collapsed ? (
            <ChevronRight size={16} className="text-white/40 group-hover:text-white" />
          ) : (
            <>
              <ChevronLeft size={16} className="text-white/40 group-hover:text-white" />
              <span className="text-xs uppercase tracking-[0.20em] text-white/35 group-hover:text-white/70">
                Recolher
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Background decorativo ────────────────────────────────────────────────────
function SidebarBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#060816_0%,#091121_40%,#0B1730_100%)]" />
      <div className="absolute -top-25 -left-25 w-62.5 h-62.5 rounded-full bg-blue-500/20 blur-[100px]" />
      <div className="absolute -bottom-30 -right-25 w-55 h-55 rounded-full bg-cyan-400/10 blur-[100px]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── MOBILE: botão hambúrguer ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl border border-white/10 bg-[#091121]/90 backdrop-blur-xl flex items-center justify-center text-white/70 hover:text-white transition-colors shadow-lg"
      >
        <Menu size={18} />
      </button>

      {/* ── MOBILE: drawer + overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="lg:hidden fixed left-0 top-0 z-50 h-screen w-72 overflow-hidden border-r border-white/10"
            >
              <SidebarBackground />
              <SidebarContent
                currentPath={currentPath}
                onNavigate={onNavigate}
                collapsed={false}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP: sidebar fixa com collapse ── */}
      <aside
        className={`hidden lg:block relative h-screen shrink-0 overflow-hidden border-r border-white/10 transition-all duration-500 ${
          collapsed ? "w-23" : "w-72.5"
        }`}
      >
        <SidebarBackground />
        <SidebarContent
          currentPath={currentPath}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onCollapse={() => setCollapsed((v) => !v)}
        />
      </aside>
    </>
  );
}