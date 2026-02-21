import { useState, useRef, useEffect } from 'react';
import Button from '../lib/components/button';

interface Project {
  id: number;
  client: string;
  title: string;
  status: 'live' | 'building' | 'paused' | 'review' | 'planned';
  url: string | null;
}

const PROJECTS: Project[] = [
  { id: 1, client: "FASHION NOVA", title: "Storefront Redesign 2.0", status: "live", url: "https://fashionnova.com" },
  { id: 2, client: "TECHFLOW", title: "Internal Analytics Dashboard", status: "building", url: "https://dev.techflow.io" },
  { id: 3, client: "ALPHABET", title: "Search AI Integration", status: "paused", url: null },
  { id: 4, client: "STRIPE", title: "Payment Gateway API Docs", status: "review", url: "https://stripe.com/docs" },
  { id: 5, client: "ACME CORP", title: "Legacy System Migration", status: "building", url: null },
  { id: 6, client: "NETFLIX", title: "TV App Performance Update", status: "planned", url: null },
];

export default function ProjectsMasterpiece() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="w-full text-[#E5E5E5] font-sans selection:bg-white/20">
      

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 pb-6 border-b border-white/8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Progetti</h1>
          </div>

          <div className="flex items-center gap-3">

            <div className="flex bg-[#121212] p-0.5 rounded-lg border border-white/8">
                <ViewIcon active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon="grid" />
                <ViewIcon active={viewMode === 'list'} onClick={() => setViewMode('list')} icon="list" />
            </div>

            <div className="w-px h-6 bg-white/8 mx-2" />


            <Button leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}>New Project</Button>
          </div>
        </div>


        <div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {PROJECTS.map((p) => <MasterpieceCard key={p.id} data={p} />)}
            </div>
          ) : (
            <div className="flex flex-col rounded-xl border border-white/8 bg-[#09090B] overflow-hidden">

                <div className="grid grid-cols-12 px-6 py-3 border-b border-white/8 bg-white/2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    <div className="col-span-4">Progetto</div>
                    <div className="col-span-3">Cliente</div>
                    <div className="col-span-3">Stato</div>
                    <div className="col-span-2 text-right">Azioni</div>
                </div>
               {PROJECTS.map((p) => <MasterpieceRow key={p.id} data={p} />)}
            </div>
          )}
        </div>
    </div>
  );
}

const MasterpieceCard = ({ data }: { data: Project }) => {
    return (
        <div className="
            flex flex-col justify-between
            rounded-xl overflow-visible
            bg-[#09090B]
            border border-white/8
            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]
            min-h-60
            relative
        ">

            <div className="p-7">
                <div className="flex justify-between items-start mb-6">
                     <span className="
                        inline-block px-2 py-1 rounded-sm 
                        bg-[#151515] border border-white/5 
                        text-[10px] font-bold text-neutral-400 uppercase tracking-widest
                     ">
                        {data.client}
                     </span>
                     <StatusBadge status={data.status} />
                </div>
                
                <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                    {data.title}
                </h3>
            </div>


            <div className="
                flex items-center justify-between
                px-5 py-4
                bg-[#0E0E10] border-t border-white/6
                rounded-b-xl
            ">
                <div className="flex items-center gap-3">
                    {data.url ? (
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                            Deployed
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-[11px] text-neutral-600 font-mono">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                            Offline
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {data.url && (
                        <a href={data.url} target="_blank" rel="noreferrer" className="p-2 text-neutral-400 hover:text-white bg-transparent active:bg-white/5 rounded-md transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    )}
                    <div className="w-px h-4 bg-white/8 mx-1" />
                    <DropdownMenu />
                </div>
            </div>
        </div>
    );
};

const MasterpieceRow = ({ data }: { data: Project }) => {
    return (
        <div className="
            grid grid-cols-12 items-center 
            px-6 py-4
            border-b border-white/4 last:border-0
            hover:bg-white/2 transition-colors
            group
        ">

            <div className="col-span-4 pr-4">
                <h4 className="text-sm font-bold text-white tracking-tight truncate">
                    {data.title}
                </h4>
                {data.url && (
                     <a href={data.url} target="_blank" rel="noreferrer" className="text-[10px] text-neutral-600 font-mono hover:text-white transition-colors mt-0.5 block truncate">
                        {data.url.replace('https://', '')}
                    </a>
                )}
            </div>


            <div className="col-span-3">
                 <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    {data.client}
                 </span>
            </div>


            <div className="col-span-3">
                 <StatusBadge status={data.status} minimal />
            </div>


            <div className="col-span-2 flex justify-end items-center gap-2">
                 {data.url && (
                    <a href={data.url} target="_blank" rel="noreferrer" className="p-2 text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                )}
                <DropdownMenu />
            </div>
        </div>
    );
};

const DropdownMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    p-2 rounded-md transition-colors
                    ${isOpen ? 'bg-white text-black' : 'text-neutral-400 hover:text-white active:bg-white/10'}
                `}
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>

            {isOpen && (
                <div className="
                    absolute right-0 mt-2 w-48 z-50
                    bg-[#18181B] border border-white/10 
                    rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.9)]
                    py-1 overflow-hidden
                ">
                    <MenuItem label="Settings" icon="cog" />
                    <MenuItem label="Members" icon="users" />
                    <div className="h-px bg-white/8 my-1 mx-2" />
                    <MenuItem label="Delete" icon="trash" destructive />
                </div>
            )}
        </div>
    );
};

const MenuItem = ({ label, icon, destructive }: { label: string, icon: string, destructive?: boolean }) => (
    <button className={`
        w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left
        transition-colors
        ${destructive 
            ? 'text-rose-500 hover:bg-rose-500/10' 
            : 'text-neutral-300 hover:bg-white/10 hover:text-white'}
    `}>
        <span className="opacity-70">
            {icon === 'cog' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            {icon === 'users' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            {icon === 'trash' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
        </span>
        {label}
    </button>
)

const StatusBadge = ({ status, minimal }: { status: string, minimal?: boolean }) => {
    const styles: Record<string, string> = {
        live: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
        building: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
        paused: 'text-neutral-400 border-neutral-700 bg-neutral-800',
        review: 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10',
        planned: 'text-white/40 border-white/10 bg-white/5',
    };
    const style = styles[status] || styles.planned;

    return (
        <span className={`
            inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
            ${style} ${minimal ? 'bg-transparent border-transparent pl-0' : ''}
        `}>
            {!minimal && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />}
            {status}
        </span>
    );
};

const ViewIcon = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: 'grid' | 'list' }) => (
    <button 
        onClick={onClick} 
        className={`p-2 rounded-md transition-colors ${active ? 'bg-[#27272A] text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}
    >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {icon === 'grid' 
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            }
        </svg>
    </button>
);