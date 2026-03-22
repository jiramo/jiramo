import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService";
import type { Project } from "../types/project";

type StatusFilter = "all" | "active" | "inactive";

function customerLabel(project: Project): string {
  if (project.Customer?.name) {
    return (
      project.Customer.name +
      " " +
      project.Customer.surname
    ).toUpperCase();
  }
  return "—";
}

export default function Overview() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Errore nel caricamento dei progetti",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const activeCount = projects.filter((p) => p.status).length;
  const inactiveCount = projects.filter((p) => !p.status).length;
  const uniqueClients = new Set(
    projects.map((p) => p.customer_id).filter(Boolean),
  ).size;

  const filtered =
    filter === "active"
      ? projects.filter((p) => p.status)
      : filter === "inactive"
        ? projects.filter((p) => !p.status)
        : projects;

  return (
    <div className="w-full max-w-400 mx-auto p-6 md:p-8 space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Statistiche
          </h2>
        </div>
        <div className="hidden md:flex gap-2">
          <FilterButton
            label="Tutti"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterButton
            label="Attivi"
            active={filter === "active"}
            onClick={() => setFilter("active")}
          />
          <FilterButton
            label="Inattivi"
            active={filter === "inactive"}
            onClick={() => setFilter("inactive")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          label="Progetti Totali"
          value={loading ? "—" : String(projects.length)}
        />
        <StatBox label="Attivi" value={loading ? "—" : String(activeCount)} />
        <StatBox
          label="Inattivi"
          value={loading ? "—" : String(inactiveCount)}
        />
        <StatBox
          label="Clienti Unici"
          value={loading ? "—" : String(uniqueClients)}
        />
      </div>

      {/* Mobile filters */}
      <div className="flex md:hidden gap-2">
        <FilterButton
          label="Tutti"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterButton
          label="Attivi"
          active={filter === "active"}
          onClick={() => setFilter("active")}
        />
        <FilterButton
          label="Inattivi"
          active={filter === "inactive"}
          onClick={() => setFilter("inactive")}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[19px] bg-[#251818]/40 border border-[#FF0000]/10 min-h-36 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-sm font-medium text-white">
            Errore nel caricamento
          </p>
          <p className="text-xs text-neutral-500">{error}</p>
          <button
            onClick={fetchProjects}
            className="text-xs text-[#FF6900] hover:text-white transition-colors underline underline-offset-2"
          >
            Riprova
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-sm font-medium text-white">
            Nessun progetto trovato
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="text-xs text-[#FF6900] hover:text-white transition-colors underline underline-offset-2"
          >
            Vai ai progetti
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <OverviewCard
              key={project.ID}
              project={project}
              onClick={() => navigate("/projects")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OverviewCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const active = project.status;
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col w-full p-0.5 pb-1 gap-1 rounded-[19px] cursor-pointer transition-all animate-in fade-in zoom-in-95 duration-300 ${
        active
          ? "bg-[#0A1F10] border border-emerald-500/30"
          : "bg-[#251818] border border-rose-500/20"
      }`}
    >
      <div className="flex flex-col items-start justify-center w-full px-5 py-4 gap-3 bg-[#0A0A0A] rounded-2xl shadow-sm shadow-black/40 border border-white/5">
        <div className="flex flex-col items-start gap-0.5 w-full">
          <h3 className="w-full truncate font-medium leading-6 text-[#DEDEDE] group-hover:text-white transition-colors">
            {project.title}
          </h3>
          <p className="w-full truncate text-[#DEDEDE]/60 text-sm">
            {customerLabel(project)}
          </p>
        </div>
        {project.description && (
          <div className="flex flex-wrap items-center gap-1.5 w-full">
            <div className="flex items-center justify-center px-2 py-0.5 bg-[#191919] border border-white/5 rounded-md">
              <span className="text-[#DEDEDE]/80 text-xs">
                {project.description.slice(0, 40) +
                  (project.description.length > 40 ? "…" : "")}
              </span>
            </div>
          </div>
        )}
      </div>
      <span
        className={`self-start ml-3 mb-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          active
            ? "text-emerald-400 bg-emerald-500/10"
            : "text-rose-400 bg-rose-500/10"
        }`}
      >
        {active ? "Attivo" : "Inattivo"}
      </span>
    </div>
  );
}

function StatBox({
  label,
  value,
  change,
  isNegative = false,
}: {
  label: string;
  value: string;
  change?: string;
  isNegative?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-[#0A0A0A]/40 border border-white/5 flex flex-col justify-between">
      <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-semibold text-white font-mono">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              isNegative
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-white/60 bg-white/5"
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-white/10 text-white border border-white/10"
          : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      {label}
    </button>
  );
}
