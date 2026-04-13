import { useState, useMemo } from "react";
import LeadsFilterBar from "../components/leads/LeadsFilterBar";
import LeadsTable, { LeadRow } from "../components/leads/LeadsTable";
import LeadsPagination from "../components/leads/LeadsPagination";

const PER_PAGE = 10;

const ALL_LEADS: LeadRow[] = [
  { id: "1",  name: "Carlos Mendes",       email: "carlos@email.com",        phone: "(11) 99021-4411", cpf: "123.456.789-01", source: "Indicação",  stage: "Proposta",        value: "R$ 85.000",  rawValue: 85000,  importance: "quente", attendant: "Suelen Valle",  createdAt: "02/04/2025" },
  { id: "2",  name: "Ana Beatriz Lima",    email: "ana.lima@gmail.com",       phone: "(11) 97001-5544", cpf: "234.567.890-12", source: "WhatsApp",   stage: "Negociação",      value: "R$ 120.000", rawValue: 120000, importance: "quente", attendant: "Rafael Melo",   createdAt: "01/04/2025" },
  { id: "3",  name: "Roberto Souza",       email: "roberto@empresa.com",      phone: "(11) 99201-3344", cpf: "345.678.901-23", source: "Site",       stage: "Qualificação",    value: "R$ 45.000",  rawValue: 45000,  importance: "morno",  attendant: "Ana Souza",     createdAt: "31/03/2025" },
  { id: "4",  name: "Fernanda Castro",     email: "fcastro@email.com",        phone: "(11) 99201-4432", cpf: "456.789.012-34", source: "Instagram",  stage: "Novo",            value: "R$ 62.000",  rawValue: 62000,  importance: "morno",  attendant: "Suelen Valle",  createdAt: "31/03/2025" },
  { id: "5",  name: "Marcelo Dias",        email: "marcelo.d@gmail.com",      phone: "(11) 98231-0011", cpf: "567.890.123-45", source: "Google",     stage: "Fechamento",      value: "R$ 210.000", rawValue: 210000, importance: "quente", attendant: "Suelen Valle",  createdAt: "28/03/2025" },
  { id: "6",  name: "Juliana Rocha",       email: "ju.rocha@email.com",       phone: "(21) 99341-5521", cpf: "678.901.234-56", source: "Indicação",  stage: "Contato Inicial", value: "R$ 38.000",  rawValue: 38000,  importance: "morno",  attendant: "Rafael Melo",   createdAt: "28/03/2025" },
  { id: "7",  name: "Paulo Teixeira",      email: "p.teixeira@gmail.com",     phone: "(11) 98877-3310", cpf: "789.012.345-67", source: "Google",     stage: "Novo",            value: "R$ 48.000",  rawValue: 48000,  importance: "frio",   attendant: "Ana Souza",     createdAt: "27/03/2025" },
  { id: "8",  name: "Camila Nogueira",     email: "camila.n@email.com",       phone: "(11) 97654-0021", cpf: "890.123.456-78", source: "Indicação",  stage: "Novo",            value: "R$ 95.000",  rawValue: 95000,  importance: "quente", attendant: "Suelen Valle",  createdAt: "26/03/2025" },
  { id: "9",  name: "Diego Almeida",       email: "diego.a@empresa.com",      phone: "(11) 98765-4432", cpf: "901.234.567-89", source: "WhatsApp",   stage: "Contato Inicial", value: "R$ 71.000",  rawValue: 71000,  importance: "quente", attendant: "Rafael Melo",   createdAt: "25/03/2025" },
  { id: "10", name: "Patrícia Lima",       email: "p.lima@email.com",         phone: "(11) 98712-0099", cpf: "012.345.678-90", source: "Indicação",  stage: "Qualificação",    value: "R$ 130.000", rawValue: 130000, importance: "quente", attendant: "Suelen Valle",  createdAt: "24/03/2025" },
  { id: "11", name: "Lucas Ferreira",      email: "lferreira@gmail.com",      phone: "(21) 97890-3312", cpf: "111.222.333-44", source: "Google",     stage: "Qualificação",    value: "R$ 55.000",  rawValue: 55000,  importance: "frio",   attendant: "Ana Souza",     createdAt: "23/03/2025" },
  { id: "12", name: "Tatiane Oliveira",    email: "tati.oli@email.com",       phone: "(11) 98001-2233", cpf: "222.333.444-55", source: "Site",       stage: "Proposta",        value: "R$ 160.000", rawValue: 160000, importance: "quente", attendant: "Suelen Valle",  createdAt: "22/03/2025" },
  { id: "13", name: "Henrique Costa",      email: "h.costa@empresa.com",      phone: "(11) 99345-7712", cpf: "333.444.555-66", source: "Instagram",  stage: "Negociação",      value: "R$ 89.000",  rawValue: 89000,  importance: "morno",  attendant: "Rafael Melo",   createdAt: "21/03/2025" },
  { id: "14", name: "Renata Barbosa",      email: "renata.b@email.com",       phone: "(31) 98123-4455", cpf: "444.555.666-77", source: "WhatsApp",   stage: "Qualificação",    value: "R$ 78.000",  rawValue: 78000,  importance: "morno",  attendant: "Ana Souza",     createdAt: "20/03/2025" },
  { id: "15", name: "Thiago Martins",      email: "thiago.m@gmail.com",       phone: "(11) 97123-5566", cpf: "555.666.777-88", source: "Site",       stage: "Novo",            value: "R$ 33.000",  rawValue: 33000,  importance: "frio",   attendant: "Rafael Melo",   createdAt: "19/03/2025" },
  { id: "16", name: "Larissa Pereira",     email: "larissa.p@email.com",      phone: "(41) 98234-5566", cpf: "666.777.888-99", source: "Indicação",  stage: "Proposta",        value: "R$ 112.000", rawValue: 112000, importance: "quente", attendant: "Suelen Valle",  createdAt: "18/03/2025" },
  { id: "17", name: "Eduardo Santos",      email: "edu.santos@empresa.com",   phone: "(11) 99456-1122", cpf: "777.888.999-00", source: "Google",     stage: "Contato Inicial", value: "R$ 67.000",  rawValue: 67000,  importance: "morno",  attendant: "Ana Souza",     createdAt: "17/03/2025" },
  { id: "18", name: "Mônica Carvalho",     email: "monica.c@gmail.com",       phone: "(21) 98567-3344", cpf: "888.999.000-11", source: "Instagram",  stage: "Fechamento",      value: "R$ 195.000", rawValue: 195000, importance: "quente", attendant: "Rafael Melo",   createdAt: "16/03/2025" },
  { id: "19", name: "Gustavo Ribeiro",     email: "g.ribeiro@email.com",      phone: "(11) 97678-4455", cpf: "999.000.111-22", source: "WhatsApp",   stage: "Negociação",      value: "R$ 143.000", rawValue: 143000, importance: "quente", attendant: "Suelen Valle",  createdAt: "15/03/2025" },
  { id: "20", name: "Isabela Gonçalves",   email: "isa.goncalves@email.com",  phone: "(31) 98789-5566", cpf: "100.200.300-40", source: "Indicação",  stage: "Qualificação",    value: "R$ 58.000",  rawValue: 58000,  importance: "morno",  attendant: "Ana Souza",     createdAt: "14/03/2025" },
  { id: "21", name: "Vinicius Moreira",    email: "vini.m@gmail.com",         phone: "(11) 99890-6677", cpf: "200.300.400-50", source: "Google",     stage: "Novo",            value: "R$ 41.000",  rawValue: 41000,  importance: "frio",   attendant: "Rafael Melo",   createdAt: "13/03/2025" },
  { id: "22", name: "Priscila Nunes",      email: "pri.nunes@empresa.com",    phone: "(41) 97901-7788", cpf: "300.400.500-60", source: "Site",       stage: "Contato Inicial", value: "R$ 92.000",  rawValue: 92000,  importance: "morno",  attendant: "Suelen Valle",  createdAt: "12/03/2025" },
];

type SortKey = keyof LeadRow | null;
type SortDir = "asc" | "desc";

export default function Leads() {
  const [search, setSearch]         = useState("");
  const [stage, setStage]           = useState("Todos");
  const [source, setSource]         = useState("Todos");
  const [importance, setImportance] = useState("Todos");
  const [page, setPage]             = useState(1);
  const [sortKey, setSortKey]       = useState<SortKey>(null);
  const [sortDir, setSortDir]       = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleClear() {
    setSearch(""); setStage("Todos"); setSource("Todos"); setImportance("Todos"); setPage(1);
  }

  const filtered = useMemo(() => {
    let list = [...ALL_LEADS];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.cpf.includes(q)
      );
    }
    if (stage !== "Todos")      list = list.filter(l => l.stage === stage);
    if (source !== "Todos")     list = list.filter(l => l.source === source);
    if (importance !== "Todos") list = list.filter(l => l.importance === importance);

    if (sortKey) {
      list.sort((a, b) => {
        const av = a[sortKey as keyof LeadRow];
        const bv = b[sortKey as keyof LeadRow];
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [search, stage, source, importance, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Leads</h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            {filtered.length} lead{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#2563EB" }}
        >
          + Novo Lead
        </button>
      </div>

      {/* Filters */}
      <LeadsFilterBar
        search={search}         onSearch={v => { setSearch(v);     setPage(1); }}
        stage={stage}           onStage={v  => { setStage(v);      setPage(1); }}
        source={source}         onSource={v => { setSource(v);     setPage(1); }}
        importance={importance} onImportance={v => { setImportance(v); setPage(1); }}
        onClear={handleClear}
      />

      {/* Table */}
      <LeadsTable
        leads={paginated}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
      />

      {/* Pagination */}
      <LeadsPagination
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        perPage={PER_PAGE}
        onPage={setPage}
      />
    </div>
  );
}
