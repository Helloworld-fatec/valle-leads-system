import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Kanban,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  ClipboardList,
  LogOut,
  Bell,
} from "lucide-react";

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
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
  { label: "Leads", icon: <ClipboardList size={18} />, path: "/leads" },
  { label: "Funil", icon: <Kanban size={18} />, path: "/funil" },
  { label: "Usuários", icon: <Users size={18} />, path: "/usuarios" },
  { label: "Perfil", icon: <UserCircle size={18} />, path: "/perfil" },
];

export default function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? "w-16" : "w-56"
      }`}
      style={{ backgroundColor: "#0F172A" }}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight">Valle</p>
            <p className="text-blue-400 text-xs leading-tight">Leads System</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 mb-3">
            Menu
          </p>
        )}
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span className={`shrink-0 ${isActive ? "text-white" : "text-white/50 group-hover:text-white"}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-300" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-4 space-y-1 border-t border-white/10 pt-3">
        {/* Notification btn */}
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Notificações" : undefined}
        >
          <div className="relative shrink-0">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">
              3
            </span>
          </div>
          {!collapsed && <span>Notificações</span>}
        </button>

        {/* Logout */}
        <button
          onClick={() => onNavigate("/login")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>

        {/* User mini card */}
        {!collapsed && (
          <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              SM
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">Suelen Martins</p>
              <p className="text-white/40 text-[10px] truncate">Gerente</p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all mt-1 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? <ChevronRight size={14} /> : (
            <>
              <ChevronLeft size={14} />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
