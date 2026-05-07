import { Users, X } from "lucide-react";

interface Props {
  selectedCount: number;
  onAssign: () => void;
  onClear: () => void;
}

export default function BulkAssignToolbar({ selectedCount, onAssign, onClear }: Props) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3 rounded-xl mb-4 border"
      style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
    >
      <div className="flex items-center gap-2">
        <Users size={16} style={{ color: "#2563EB" }} />
        <span className="text-sm font-medium" style={{ color: "#1D4ED8" }}>
          {selectedCount} lead{selectedCount !== 1 ? "s" : ""} selecionado{selectedCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onAssign}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#2563EB" }}
        >
          Atribuir Selecionados
        </button>
        <button
          onClick={onClear}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-all"
          style={{ color: "#2563EB" }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}