import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

interface MainLayoutProps {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function MainLayout({ children, currentPath, onNavigate }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — escondida em mobile (renderiza o hambúrguer internamente) */}
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/*
          Em mobile o hambúrguer fica no canto superior esquerdo do Header.
          Adicionamos pl-16 em telas pequenas para o título não sobrepor o botão.
        */}
        <Header currentPath={currentPath} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}