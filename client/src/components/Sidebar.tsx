import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  Kanban,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LogOut,
  Bell,
} from "lucide-react";

import { motion } from "framer-motion";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/dashboard",
  },
  {
    label: "Leads",
    icon: <ClipboardList size={18} />,
    path: "/leads",
  },
  {
    label: "Funil",
    icon: <Kanban size={18} />,
    path: "/funil",
  },
  {
    label: "Usuários",
    icon: <Users size={18} />,
    path: "/usuarios",
  },
  {
    label: "Perfil",
    icon: <UserCircle size={18} />,
    path: "/perfil",
  },
];

export default function Sidebar({
  currentPath,
  onNavigate,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative h-screen sticky top-0 shrink-0 overflow-hidden border-r border-white/10 transition-all duration-500 ${
        collapsed ? "w-[92px]" : "w-[290px]"
      }`}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#060816_0%,#091121_40%,#0B1730_100%)]" />

      {/* GLOW */}
      <div className="absolute top-[-100px] left-[-100px] w-[250px] h-[250px] rounded-full bg-blue-500/20 blur-[100px]" />

      <div className="absolute bottom-[-120px] right-[-100px] w-[220px] h-[220px] rounded-full bg-cyan-400/10 blur-[100px]" />

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col h-full px-4 py-5">

        {/* LOGO */}
        <motion.div
          layout
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-4"
          }`}
        >

          {/* LOGO IMAGE */}
          <motion.div
            whileHover={{
              scale: 1.05,
            }}
            className="relative shrink-0"
          >

            {/* glow */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl" />

            {/* container */}
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden shadow-[0_0_25px_rgba(37,99,235,0.25)]">

              <img
                src="/logo.jpeg"
                alt="Valle Leads"
                className="w-11 h-11 object-contain"
              />
            </div>
          </motion.div>

          {/* TEXT */}
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden"
            >
              <h1 className="text-white font-semibold text-[20px] leading-none tracking-tight">
                Valle
              </h1>

              <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-blue-300">
                Leads System
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* DIVIDER */}
        <div className="h-px bg-white/10 my-6" />

        {/* STATUS */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4 shadow-[0_0_35px_rgba(37,99,235,0.08)]"
          >

            <div className="flex items-center gap-3">

              <div className="relative">

                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />

                <div className="relative w-3 h-3 rounded-full bg-emerald-400" />
              </div>

              <div>
                <p className="text-white text-sm font-medium">
                  Sistema online
                </p>

                <p className="text-white/40 text-xs">
                  Operando normalmente
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* MENU */}
        <div className="flex-1">

          {!collapsed && (
            <p className="text-[11px] uppercase tracking-[0.30em] text-white/25 px-3 mb-4">
              Navegação
            </p>
          )}

          <nav className="space-y-2">

            {navItems.map((item, index) => {
              const isActive = currentPath === item.path;

              return (
                <motion.button
                  key={item.path}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.06,
                  }}
                  whileHover={{
                    x: 4,
                  }}
                  onClick={() => onNavigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex items-center w-full overflow-hidden rounded-2xl transition-all duration-300 ${
                    collapsed
                      ? "justify-center h-[58px]"
                      : "gap-4 px-4 h-[58px]"
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-cyan-400/10 border border-blue-400/20 shadow-[0_0_25px_rgba(37,99,235,0.15)]"
                      : "hover:bg-white/[0.05]"
                  }`}
                >

                  {/* ACTIVE LINE */}
                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-300 to-blue-500 rounded-r-full" />
                  )}

                  {/* ICON */}
                  <div
                    className={`relative flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isActive
                        ? "text-cyan-300"
                        : "text-white/45 group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </div>

                  {/* TEXT */}
                  {!collapsed && (
                    <>
                      <span
                        className={`text-sm transition-all ${
                          isActive
                            ? "text-white font-medium"
                            : "text-white/60 group-hover:text-white"
                        }`}
                      >
                        {item.label}
                      </span>

                      {isActive && (
                        <motion.div
                          layoutId="active-dot"
                          className="ml-auto w-2 h-2 rounded-full bg-cyan-300"
                        />
                      )}
                    </>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM */}
        <div className="mt-5">

          {/* NOTIFICATIONS */}
          <button
            className={`group relative flex items-center rounded-2xl transition-all duration-300 mb-3 ${
              collapsed
                ? "justify-center w-full h-[56px]"
                : "gap-4 px-4 w-full h-[56px]"
            } bg-white/[0.03] hover:bg-white/[0.06] border border-white/5`}
          >

            <div className="relative">

              <Bell
                size={18}
                className="text-white/50 group-hover:text-white transition-colors"
              />

              <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg shadow-red-500/40">
                3
              </div>
            </div>

            {!collapsed && (
              <span className="text-sm text-white/60 group-hover:text-white">
                Notificações
              </span>
            )}
          </button>

          {/* PROFILE */}
          {!collapsed && (
            <motion.div
              whileHover={{
                y: -2,
              }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4 mb-4"
            >

              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-400/5" />

              <div className="relative flex items-center gap-3">

                <div className="relative">

                  <div className="absolute inset-0 rounded-2xl bg-blue-500 blur-lg opacity-40" />

                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-[0_0_25px_rgba(37,99,235,0.35)]">
                    SM
                  </div>
                </div>

                <div className="overflow-hidden">
                  <h2 className="text-white text-sm font-medium truncate">
                    Suelen Martins
                  </h2>

                  <p className="text-white/35 text-xs mt-0.5">
                    Gerente Comercial
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* LOGOUT */}
          <button
            onClick={() => onNavigate("/login")}
            className={`group w-full flex items-center rounded-2xl transition-all duration-300 ${
              collapsed
                ? "justify-center h-[54px]"
                : "gap-4 px-4 h-[54px]"
            } hover:bg-red-500/10`}
          >

            <LogOut
              size={18}
              className="text-white/35 group-hover:text-red-400 transition-colors"
            />

            {!collapsed && (
              <span className="text-sm text-white/45 group-hover:text-red-400 transition-colors">
                Sair da plataforma
              </span>
            )}
          </button>

          {/* COLLAPSE */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`group mt-4 w-full flex items-center rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-all duration-300 ${
              collapsed
                ? "justify-center h-[52px]"
                : "gap-3 px-4 h-[52px]"
            }`}
          >

            {collapsed ? (
              <ChevronRight
                size={16}
                className="text-white/40 group-hover:text-white"
              />
            ) : (
              <>
                <ChevronLeft
                  size={16}
                  className="text-white/40 group-hover:text-white"
                />

                <span className="text-xs uppercase tracking-[0.20em] text-white/35 group-hover:text-white/70">
                  Recolher
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}