
import Card from '../lib/components/card'; 


const PROJECTS_DATA = [
  {
    id: 1,
    title: "Redesign Dashboard",
    subtitle: "UX/UI Experience Update",
    tags: ["Figma", "React", "Frontend"],
    statusLabel: "IN PROGRESS",
    active: true, 
  },
  {
    id: 2,
    title: "API Migration v2",
    subtitle: "Backend Infrastructure",
    tags: ["Node.js", "AWS", "Docker"],
    statusLabel: "HIGH PRIORITY",
    active: false,
  },
  {
    id: 3,
    title: "Mobile App Auth",
    subtitle: "Security Patch",
    tags: ["Flutter", "OAuth", "Security"],
    statusLabel: "REVIEW",
    active: false,
  },
  {
    id: 4,
    title: "Q4 Marketing Assets",
    subtitle: "Campaign Preparation",
    tags: ["Design", "Content"],
    statusLabel: "NEW",
    active: false,
  },
  {
    id: 5,
    title: "Database Optimization",
    subtitle: "Performance Tuning",
    tags: ["PostgreSQL", "Redis"],
    statusLabel: undefined, 
    active: false,
  },
  {
    id: 6,
    title: "Internal Tools",
    subtitle: "Admin Panel Fixes",
    tags: ["Retool", "Internal"],
    statusLabel: "BACKLOG",
    active: false,
  },
];

export default function Overview() {
  return (
    <div className="w-full max-w-400 mx-auto p-6 md:p-8 space-y-8">
      

      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Statistiche</h2>
        </div>
        

        <div className="hidden md:flex gap-2">
          <FilterButton label="Tutti" active />
          <FilterButton label="Attivi" />
          <FilterButton label="In Scadenza" />
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Progetti Totali" value="12" change="+2" />
        <StatBox label="Task Aperti" value="34" change="-5" isNegative />
        <StatBox label="Ore Sviluppo" value="128h" change="+12%" />
        <StatBox label="Team Active" value="8" />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {PROJECTS_DATA.map((project) => (
          <Card
            key={project.id}
            title={project.title}
            subtitle={project.subtitle}
            tags={project.tags}
            statusLabel={project.statusLabel}
            active={project.active}
            onClick={() => console.log(`Card ${project.id} clicked`)}
            
            className="animate-in fade-in zoom-in-95 duration-300" 
          />
        ))}
      </div>

    </div>
  );
}



function StatBox({ label, value, change, isNegative = false }: { label: string, value: string, change?: string, isNegative?: boolean }) {
  return (
    <div className="
      p-4 rounded-xl
      bg-[#0A0A0A]/40 border border-white/5
      flex flex-col justify-between
    ">
      <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">{label}</span>
      <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-semibold text-white font-mono">{value}</span>
        {change && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isNegative ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/60 bg-white/5'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function FilterButton({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={`
      px-3 py-1.5 rounded-lg text-xs font-medium transition-all
      ${active 
        ? 'bg-white/10 text-white border border-white/10' 
        : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}
    `}>
      {label}
    </button>
  );
}