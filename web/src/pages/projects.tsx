import { useState, useRef, useEffect, useCallback } from 'react';
import React from 'react';
import {
  Plus, LayoutGrid, List, MoreVertical, Settings, Copy, Check,
  PauseCircle, PlayCircle, Trash2, AlertTriangle, FolderOpen, X, Search,
} from 'lucide-react';
import Button from '../lib/components/button';
import { projectService } from '../services/projectService';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project';

interface UserOption {
  ID: string;
  name: string;
  surname: string;
  email: string;
}

function customerLabel(project: Project): string {
  if (project.Customer?.name) {
    return (project.Customer.name + ' ' + project.Customer.surname).toUpperCase();
  }
  return '—';
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
  };
}

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore nel caricamento dei progetti');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreateDone = (created: Project) => {
    setProjects((prev) => [created, ...prev]);
    setShowCreate(false);
  };

  const handleEditDone = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.ID === updated.ID ? updated : p)));
    setEditTarget(null);
  };

  const handleDeleteDone = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.ID !== id));
    setDeleteTarget(null);
  };

  const handleToggleDone = async (id: string) => {
    try {
      const updated = await projectService.toggleStatus(id);
      setProjects((prev) => prev.map((p) => (p.ID === updated.ID ? updated : p)));
    } catch {
      // silently ignore
    }
    setToggleTarget(null);
  };

  const [toggleTarget, setToggleTarget] = useState<Project | null>(null);

  const handleCopyToken = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => { /* ignore */ });
  };

  return (
    <div className="w-full text-[#E5E5E5] font-sans selection:bg-white/20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 pb-6 border-b border-white/8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Progetti</h1>
          {!loading && !error && (
            <p className="text-sm text-neutral-500">{projects.length} progett{projects.length === 1 ? 'o' : 'i'}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#121212] p-0.5 rounded-lg border border-white/8">
            <ViewIcon active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon="grid" />
            <ViewIcon active={viewMode === 'list'} onClick={() => setViewMode('list')} icon="list" />
          </div>
          <div className="w-px h-6 bg-white/8 mx-2" />
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreate(true)}
          >
            Nuovo Progetto
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProjects} />
      ) : projects.length === 0 ? (
        <EmptyState onNew={() => setShowCreate(true)} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((p) => (
            <MasterpieceCard key={p.ID} data={p} onEdit={() => setEditTarget(p)} onDelete={() => setDeleteTarget(p)} onToggleConfirm={() => setToggleTarget(p)} onCopyToken={() => handleCopyToken(p.ID)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col rounded-xl border border-white/8 bg-[#09090B] overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 border-b border-white/8 bg-white/2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            <div className="col-span-4">Progetto</div>
            <div className="col-span-3">Cliente</div>
            <div className="col-span-3">Stato</div>
            <div className="col-span-2 text-right">Azioni</div>
          </div>
          {projects.map((p) => (
            <MasterpieceRow key={p.ID} data={p} onEdit={() => setEditTarget(p)} onDelete={() => setDeleteTarget(p)} onToggleConfirm={() => setToggleTarget(p)} onCopyToken={() => handleCopyToken(p.ID)} />
          ))}
        </div>
      )}

      {showCreate && <ProjectModal mode="create" onClose={() => setShowCreate(false)} onDone={handleCreateDone} />}
      {editTarget && <ProjectModal mode="edit" project={editTarget} onClose={() => setEditTarget(null)} onDone={handleEditDone} />}
      {deleteTarget && <DeleteModal project={deleteTarget} onClose={() => setDeleteTarget(null)} onDone={handleDeleteDone} />}
      {toggleTarget && <ToggleConfirmModal project={toggleTarget} onClose={() => setToggleTarget(null)} onDone={handleToggleDone} />}
    </div>
  );
}

const MasterpieceCard = ({ data, onEdit, onDelete, onToggleConfirm, onCopyToken }: { data: Project; onEdit: () => void; onDelete: () => void; onToggleConfirm: () => void; onCopyToken: () => void }) => (
  <div className="flex flex-col justify-between rounded-xl overflow-visible bg-[#09090B] border border-white/8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] min-h-60 relative">
    <div className="p-7">
      <div className="flex justify-between items-start mb-6">
        <span className="inline-block px-2 py-1 rounded-sm bg-[#151515] border border-white/5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          {customerLabel(data)}
        </span>
        <StatusBadge status={data.status} />
      </div>
      <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">{data.title}</h3>
      {data.description && <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{data.description}</p>}
    </div>
    <div className="flex items-center justify-between px-5 py-4 bg-[#0E0E10] border-t border-white/6 rounded-b-xl">
      <div className="flex items-center gap-2 text-[11px] font-mono">
        <div className={data.status ? 'w-1.5 h-1.5 rounded-full bg-emerald-500/60' : 'w-1.5 h-1.5 rounded-full bg-neutral-700'} />
        <span className={data.status ? 'text-neutral-400' : 'text-neutral-600'}>{data.status ? 'Attivo' : 'Inattivo'}</span>
      </div>
      <DropdownMenu status={data.status} onEdit={onEdit} onDelete={onDelete} onToggleConfirm={onToggleConfirm} onCopyToken={onCopyToken} />
    </div>
  </div>
);

const MasterpieceRow = ({ data, onEdit, onDelete, onToggleConfirm, onCopyToken }: { data: Project; onEdit: () => void; onDelete: () => void; onToggleConfirm: () => void; onCopyToken: () => void }) => (
  <div className="grid grid-cols-12 items-center px-6 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors group">
    <div className="col-span-4 pr-4">
      <h4 className="text-sm font-bold text-white tracking-tight truncate">{data.title}</h4>
      {data.description && <p className="text-[10px] text-neutral-600 mt-0.5 truncate">{data.description}</p>}
    </div>
    <div className="col-span-3">
      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{customerLabel(data)}</span>
    </div>
    <div className="col-span-3"><StatusBadge status={data.status} minimal /></div>
    <div className="col-span-2 flex justify-end items-center gap-2">
      <DropdownMenu status={data.status} onEdit={onEdit} onDelete={onDelete} onToggleConfirm={onToggleConfirm} onCopyToken={onCopyToken} />
    </div>
  </div>
);

const DropdownMenu = ({ status, onEdit, onDelete, onToggleConfirm, onCopyToken }: { status: boolean; onEdit: () => void; onDelete: () => void; onToggleConfirm: () => void; onCopyToken: () => void }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { onCopyToken(); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={isOpen ? 'p-2 rounded-md transition-colors bg-white text-black' : 'p-2 rounded-md transition-colors text-neutral-400 hover:text-white active:bg-white/10'}
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 z-50 bg-[#18181B] border border-white/10 rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.9)] py-1 overflow-hidden">
          <MenuItem label="Modifica" icon="cog" onClick={() => { onEdit(); setIsOpen(false); }} />
          <MenuItem
            label={copied ? 'Copiato!' : 'Copia Token'}
            icon={copied ? 'check' : 'copy'}
            onClick={handleCopy}
          />
          <div className="h-px bg-white/8 my-1 mx-2" />
          <MenuItem
            label={status ? 'Disattiva' : 'Attiva'}
            icon={status ? 'pause' : 'play'}
            destructive={status}
            onClick={() => { onToggleConfirm(); setIsOpen(false); }}
          />
          <MenuItem label="Elimina" icon="trash" destructive onClick={() => { onDelete(); setIsOpen(false); }} />
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ label, icon, destructive, onClick }: { label: string; icon: string; destructive?: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={destructive ? 'w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left transition-colors text-rose-500 hover:bg-rose-500/10' : 'w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left transition-colors text-neutral-300 hover:bg-white/10 hover:text-white'}
  >
    <span className="opacity-70">
      {icon === 'cog' && <Settings className="w-3.5 h-3.5" />}
      {icon === 'play' && <PlayCircle className="w-3.5 h-3.5" />}
      {icon === 'pause' && <PauseCircle className="w-3.5 h-3.5" />}
      {icon === 'copy' && <Copy className="w-3.5 h-3.5" />}
      {icon === 'check' && <Check className="w-3.5 h-3.5" />}
      {icon === 'trash' && <Trash2 className="w-3.5 h-3.5" />}
    </span>
    {label}
  </button>
)

const StatusBadge = ({ status, minimal }: { status: boolean; minimal?: boolean }) => {
  const style = status ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' : 'text-neutral-400 border-neutral-700 bg-neutral-800';
  return (
    <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ' + style + (minimal ? ' bg-transparent border-transparent pl-0' : '')}>
      {!minimal && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />}
      {status ? 'Attivo' : 'Inattivo'}
    </span>
  );
};

const LoadingSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col rounded-xl border border-white/8 bg-[#09090B] overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 items-center px-6 py-4 border-b border-white/4 last:border-0 animate-pulse">
            <div className="col-span-4 h-4 bg-white/5 rounded" />
            <div className="col-span-3 h-3 bg-white/5 rounded w-2/3" />
            <div className="col-span-3 h-5 bg-white/5 rounded w-16" />
            <div className="col-span-2 flex justify-end"><div className="h-8 w-8 bg-white/5 rounded-md" /></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-[#09090B] border border-white/8 min-h-60 animate-pulse">
          <div className="p-7 space-y-4">
            <div className="flex justify-between"><div className="h-5 w-24 bg-white/5 rounded-sm" /><div className="h-5 w-14 bg-white/5 rounded" /></div>
            <div className="h-7 w-3/4 bg-white/5 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
    <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
      <AlertTriangle className="w-6 h-6 text-rose-400" />
    </div>
    <div>
      <p className="text-sm font-medium text-white">Errore nel caricamento</p>
      <p className="text-xs text-neutral-500 mt-1">{message}</p>
    </div>
    <button onClick={onRetry} className="text-xs text-[#FF6900] hover:text-white transition-colors underline underline-offset-2">Riprova</button>
  </div>
);

const EmptyState = ({ onNew }: { onNew: () => void }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
    <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center">
      <FolderOpen className="w-6 h-6 text-neutral-500" />
    </div>
    <div>
      <p className="text-sm font-medium text-white">Nessun progetto</p>
      <p className="text-xs text-neutral-500 mt-1">Crea il tuo primo progetto per iniziare</p>
    </div>
    <button onClick={onNew} className="text-xs text-[#FF6900] hover:text-white transition-colors underline underline-offset-2">Crea progetto</button>
  </div>
);

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/8 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-[11px] text-rose-400">{error}</p>}
  </div>
);

const inputCls = 'w-full px-3 py-2.5 bg-[#121212] border border-white/8 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF6900]/60 focus:ring-1 focus:ring-[#FF6900]/30 transition-colors';

type ProjectModalProps =
  | { mode: 'create'; project?: undefined; onClose: () => void; onDone: (p: Project) => void }
  | { mode: 'edit'; project: Project; onClose: () => void; onDone: (p: Project) => void };

function ProjectModal({ mode, project, onClose, onDone }: ProjectModalProps) {
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [customerId, setCustomerId] = useState(project?.customer_id ?? '');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/users', { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { users?: UserOption[] } | UserOption[]) => {
        if (Array.isArray(data)) setUsers(data);
        else setUsers(data.users ?? []);
      })
      .catch(() => setUsers([]));
  }, []);

  const [userSearch, setUserSearch] = useState(
    project ? (project.Customer ? project.Customer.name + ' ' + project.Customer.surname : '') : ''
  );
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target as Node))
        setShowUserDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.surname.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const selectedUser = users.find((u) => u.ID === customerId);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) errs.title = 'Minimo 3 caratteri';
    if (title.trim().length > 32) errs.title = 'Massimo 32 caratteri';
    if (!customerId.trim()) errs.customerId = 'Campo obbligatorio';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setApiError(null);
    setSubmitting(true);
    try {
      let result: Project;
      if (mode === 'create') {
        const input: CreateProjectInput = { title: title.trim(), description: description.trim(), customer_id: customerId };
        result = await projectService.createProject(input);
      } else {
        const input: UpdateProjectInput = {};
        if (title.trim() !== project.title) input.title = title.trim();
        if (description.trim() !== project.description) input.description = description.trim();
        if (customerId !== project.customer_id) input.customer_id = customerId;
        result = await projectService.updateProject(project.ID, input);
      }
      onDone(result);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Errore imprevisto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={mode === 'create' ? 'Nuovo Progetto' : 'Modifica Progetto'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <Field label="Titolo" error={fieldErrors.title}>
          <input className={inputCls} placeholder="Es. Redesign sito web" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={32} autoFocus />
        </Field>
        <Field label="Descrizione">
          <textarea className={inputCls + ' resize-none h-20'} placeholder="Descrizione opzionale del progetto" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Cliente" error={fieldErrors.customerId}>
          <div className="relative" ref={userSearchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
              <input
                className={inputCls + ' pl-8'}
                placeholder="Cerca per nome o email…"
                value={selectedUser && !showUserDropdown ? selectedUser.name + ' ' + selectedUser.surname + ' (' + selectedUser.email + ')' : userSearch}
                onFocus={() => { setShowUserDropdown(true); if (selectedUser) setUserSearch(''); }}
                onChange={(e) => { setUserSearch(e.target.value); setCustomerId(''); setShowUserDropdown(true); }}
                autoComplete="new-password"
              />
              {customerId && (
                <button type="button" onClick={() => { setCustomerId(''); setUserSearch(''); setShowUserDropdown(true); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {showUserDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-[#18181B] border border-white/10 rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.9)] max-h-48 overflow-y-auto py-1">
                {filteredUsers.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-neutral-500">Nessun utente trovato</p>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.ID}
                      type="button"
                      onClick={() => { setCustomerId(u.ID); setUserSearch(''); setShowUserDropdown(false); }}
                      className={`w-full flex flex-col px-3 py-2 text-left transition-colors hover:bg-white/10 ${
                        customerId === u.ID ? 'bg-white/8' : ''
                      }`}
                    >
                      <span className="text-xs font-medium text-white">{u.name} {u.surname}</span>
                      <span className="text-[10px] text-neutral-500">{u.email}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </Field>
        {apiError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{apiError}</p>}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/6 mt-2">
          <button type="button" onClick={onClose} className="px-4 h-9 text-sm font-medium text-neutral-400 hover:text-white bg-white/4 hover:bg-white/8 rounded-lg transition-colors">Annulla</button>
          <Button type="submit" loading={submitting} disabled={submitting}>{mode === 'create' ? 'Crea Progetto' : 'Salva Modifiche'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function ToggleConfirmModal({ project, onClose, onDone }: { project: Project; onClose: () => void; onDone: (id: string) => void }) {
  const [toggling, setToggling] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const isActive = project.status;

  const handleToggle = async () => {
    setToggling(true);
    setApiError(null);
    try {
      await onDone(project.ID);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Errore durante la modifica');
      setToggling(false);
    }
  };

  return (
    <Modal title={isActive ? 'Disattiva Progetto' : 'Attiva Progetto'} onClose={onClose}>
      <div className="flex flex-col gap-5 p-6">
        <div className={`rounded-xl border p-4 flex gap-4 items-start ${
          isActive ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
        }`}>
          <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            isActive ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
          }`}>
            {isActive ? (
              <PauseCircle className="w-5 h-5 text-amber-400" />
            ) : (
              <PlayCircle className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {isActive ? 'Vuoi disattivare ' : 'Vuoi attivare '}
              <span className="text-[#FF6900]">"{project.title}"</span>?
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {isActive
                ? 'Il progetto verrà segnato come inattivo e non sarà più visibile come attivo.'
                : 'Il progetto verrà riattivato e risulterà nuovamente attivo.'}
            </p>
          </div>
        </div>
        {apiError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{apiError}</p>}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/6 mt-2">
          <button type="button" onClick={onClose} disabled={toggling} className="px-4 h-9 text-sm font-medium text-neutral-400 hover:text-white bg-white/4 hover:bg-white/8 rounded-lg transition-colors disabled:opacity-50">Annulla</button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`px-4 h-9 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-700 hover:bg-emerald-600'
            }`}
          >
            {toggling && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isActive ? 'Disattiva' : 'Attiva'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteModal({ project, onClose, onDone }: { project: Project; onClose: () => void; onDone: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setApiError(null);
    try {
      await projectService.deleteProject(project.ID);
      onDone(project.ID);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Errore durante l'eliminazione");
      setDeleting(false);
    }
  };

  return (
    <Modal title="Elimina Progetto" onClose={onClose}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex gap-4 items-start">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Sei sicuro di voler eliminare <span className="text-[#FF6900]">"{project.title}"</span>?</p>
            <p className="text-xs text-neutral-500 mt-1">Questa azione e irreversibile e rimuovera il progetto definitivamente.</p>
          </div>
        </div>
        {apiError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{apiError}</p>}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/6 mt-2">
          <button type="button" onClick={onClose} disabled={deleting} className="px-4 h-9 text-sm font-medium text-neutral-400 hover:text-white bg-white/4 hover:bg-white/8 rounded-lg transition-colors disabled:opacity-50">Annulla</button>
          <button onClick={handleDelete} disabled={deleting} className="px-4 h-9 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
            {deleting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Elimina
          </button>
        </div>
      </div>
    </Modal>
  );
}

const ViewIcon = ({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: 'grid' | 'list' }) => (
  <button onClick={onClick} className={active ? 'p-2 rounded-md transition-colors bg-[#27272A] text-white shadow-sm' : 'p-2 rounded-md transition-colors text-neutral-500 hover:text-white'}>
    {icon === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
  </button>
);