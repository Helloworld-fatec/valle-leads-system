import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPage: (p: number) => void;
};

export default function LeadsPagination({ page, totalPages, total, perPage, onPage }: Props) {
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    p => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
      <p className="text-sm" style={{ color: "#6B7280" }}>
        Mostrando <span className="font-semibold" style={{ color: "#111827" }}>{from}–{to}</span> de{" "}
        <span className="font-semibold" style={{ color: "#111827" }}>{total}</span> leads
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, idx) => {
          const prev = pages[idx - 1];
          const gap = prev && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {gap && <span className="text-xs px-1" style={{ color: "#9CA3AF" }}>…</span>}
              <button
                onClick={() => onPage(p)}
                className="w-8 h-8 rounded-lg text-sm font-medium border transition-all"
                style={
                  p === page
                    ? { background: "#2563EB", color: "#fff", borderColor: "#2563EB" }
                    : { background: "#fff", color: "#374151", borderColor: "#E5E7EB" }
                }
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
