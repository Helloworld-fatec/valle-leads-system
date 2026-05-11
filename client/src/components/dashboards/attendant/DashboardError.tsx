// src/components/dashboards/attendant/DashboardError.tsx
interface DashboardErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function DashboardError({
  message = "Erro ao carregar os dados.",
  onRetry,
}: DashboardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: "#FEF2F2" }}
      >
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <circle cx={12} cy={12} r={10} stroke="#DC2626" strokeWidth={2} />
          <path d="M12 7v5" stroke="#DC2626" strokeWidth={2} strokeLinecap="round" />
          <circle cx={12} cy={16} r={1} fill="#DC2626" />
        </svg>
      </div>
      <p className="text-sm font-medium" style={{ color: "#374151" }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-sm font-medium transition"
          style={{ background: "#2563EB", color: "#fff" }}
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
