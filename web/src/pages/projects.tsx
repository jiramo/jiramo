import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, LayoutGrid, List, MoreVertical, Settings, Copy, Check,
  PauseCircle, PlayCircle, Trash2, X, Search, KeyRound,
} from 'lucide-react';
import Button from '../lib/components/button';
import { Modal, Field, inputCls, ErrorState, EmptyState, SkeletonCard, SkeletonList, Toggle } from '../lib/components/ui';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { apiKeyService, type APIKey, type CreateAPIKeyInput, type CreateAPIKeyResponse } from '../services/apiKeyService';
import type { Project, UpdateProjectInput } from '../types/project';
import type { User } from '../types/user';

function customerLabel(project: Project): string {
  return project.Customer?.name ? `${project.Customer.name} ${project.Customer.surname}`.toUpperCase() : '—';
}

function StatusBadge({ status, minimal }: { status: boolean; minimal?: boolean }) {
  const style = status
    ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
    : 'text-neutral-400 border-neutral-700 bg-neutral-800';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${style}${minimal ? ' bg-transparent border-transparent pl-0' : ''}`}>
      {!minimal && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />}
      {status ? 'Attivo' : 'Inattivo'}
    </span>
  );
}

function ViewIcon({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: 'grid' | 'list' }) {
  return (
    <button onClick={onClick} className={`p-2 rounded-md transition-colors ${active ? 'bg-[#27272A] text-white' : 'text-neutral-500 hover:text-white'}`}>
      {icon === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
    </button>
  );
}

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Project | null>(null);
  const [apiKeyTarget, setApiKeyTarget] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore nel caricamento');
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
    const project = projects.find((p) => p.ID === id);
    if (!project) return;

    if (project.status) {
      const updated = await projectService.toggleStatus(id);
      setProjects((prev) => prev.map((p) => (p.ID === updated.ID ? updated : p)));
    } else {
      await projectService.activateStatus(id);
      setProjects((prev) => prev.map((p) => (p.ID === id ? { ...p, status: true } : p)));
    }
    setToggleTarget(null);
  };

  const handleCopyToken = (id: string) => navigator.clipboard.writeText(id).catch(() => {});

  return (
    <div className="w-full text-[#E5E5E5] font-sans">
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
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>Nuovo Progetto</Button>
        </div>
      </div>

      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <SkeletonList rows={5} />
        )
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProjects} />
      ) : projects.length === 0 ? (
        <EmptyState message="Nessun progetto" action="Crea progetto" onAction={() => setShowCreate(true)} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.ID} project={p} onEdit={() => setEditTarget(p)} onDelete={() => setDeleteTarget(p)} onToggle={() => setToggleTarget(p)} onKeys={() => setApiKeyTarget(p)} onCopy={() => handleCopyToken(p.ID)} />
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
            <ProjectRow key={p.ID} project={p} onEdit={() => setEditTarget(p)} onDelete={() => setDeleteTarget(p)} onToggle={() => setToggleTarget(p)} onKeys={() => setApiKeyTarget(p)} onCopy={() => handleCopyToken(p.ID)} />
          ))}
        </div>
      )}

      {showCreate && <ProjectModal mode="create" onClose={() => setShowCreate(false)} onDone={handleCreateDone} />}
      {editTarget && <ProjectModal mode="edit" project={editTarget} onClose={() => setEditTarget(null)} onDone={handleEditDone} />}
      {deleteTarget && <DeleteModal project={deleteTarget} onClose={() => setDeleteTarget(null)} onDone={handleDeleteDone} />}
      {toggleTarget && <ToggleModal project={toggleTarget} onClose={() => setToggleTarget(null)} onDone={handleToggleDone} />}
      {apiKeyTarget && <APIKeysModal project={apiKeyTarget} onClose={() => setApiKeyTarget(null)} />}
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete, onToggle, onKeys, onCopy }: { project: Project; onEdit: () => void; onDelete: () => void; onToggle: () => void; onKeys: () => void; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col justify-between rounded-xl bg-[#09090B] border border-white/8 min-h-60">
      <div className="p-7">
        <div className="flex justify-between items-start mb-6">
          <span className="inline-block px-2 py-1 rounded-sm bg-[#151515] border border-white/5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            {customerLabel(project)}
          </span>
          <StatusBadge status={project.status} />
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">{project.title}</h3>
        {project.description && <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{project.description}</p>}
        <div className="mt-4 pt-4 border-t border-white/6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Project ID</p>
              <p className="text-[11px] font-mono text-neutral-400 truncate">{project.ID}</p>
            </div>
            <button onClick={handleCopy} className="shrink-0 p-2 rounded-md text-neutral-400 hover:text-white hover:bg-white/8 transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-4 bg-[#0E0E10] border-t border-white/6 rounded-b-xl">
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <div className={`w-1.5 h-1.5 rounded-full ${project.status ? 'bg-emerald-500/60' : 'bg-neutral-700'}`} />
          <span className={project.status ? 'text-neutral-400' : 'text-neutral-600'}>{project.status ? 'Attivo' : 'Inattivo'}</span>
        </div>
        <ProjectDropdown status={project.status} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} onKeys={onKeys} />
      </div>
    </div>
  );
}

function ProjectRow({ project, onEdit, onDelete, onToggle, onKeys, onCopy }: { project: Project; onEdit: () => void; onDelete: () => void; onToggle: () => void; onKeys: () => void; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="grid grid-cols-12 items-center px-6 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors group">
      <div className="col-span-4 pr-4">
        <h4 className="text-sm font-bold text-white tracking-tight truncate">{project.title}</h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[9px] font-mono text-neutral-600 truncate max-w-50">{project.ID}</span>
          <button onClick={handleCopy} className="shrink-0 p-0.5 rounded text-neutral-500 hover:text-white hover:bg-white/8 transition-colors opacity-0 group-hover:opacity-100">
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
      <div className="col-span-3">
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{customerLabel(project)}</span>
      </div>
      <div className="col-span-3"><StatusBadge status={project.status} minimal /></div>
      <div className="col-span-2 flex justify-end items-center gap-2">
        <ProjectDropdown status={project.status} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} onKeys={onKeys} />
      </div>
    </div>
  );
}

function ProjectDropdown({ status, onEdit, onDelete, onToggle, onKeys }: { status: boolean; onEdit: () => void; onDelete: () => void; onToggle: () => void; onKeys: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={`p-2 rounded-md transition-colors ${open ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}>
        <MoreVertical className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 z-50 bg-[#18181B] border border-white/10 rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.9)] py-1">
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left text-neutral-300 hover:bg-white/10 hover:text-white">
            <Settings className="w-3.5 h-3.5 opacity-70" />Modifica
          </button>
          <button onClick={() => { onKeys(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left text-neutral-300 hover:bg-white/10 hover:text-white">
            <KeyRound className="w-3.5 h-3.5 opacity-70" />API Keys
          </button>
          <button onClick={() => { onToggle(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left text-neutral-300 hover:bg-white/10 hover:text-white">
            {status ? <PauseCircle className="w-3.5 h-3.5 opacity-70" /> : <PlayCircle className="w-3.5 h-3.5 opacity-70" />}
            {status ? 'Disattiva' : 'Attiva'}
          </button>
          <div className="h-px bg-white/8 my-1 mx-2" />
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left text-rose-500 hover:bg-rose-500/10">
            <Trash2 className="w-3.5 h-3.5 opacity-70" />Elimina
          </button>
        </div>
      )}
    </div>
  );
}

type ProjectModalProps = { mode: 'create'; project?: undefined; onClose: () => void; onDone: (p: Project) => void } | { mode: 'edit'; project: Project; onClose: () => void; onDone: (p: Project) => void };

function ProjectModal({ mode, project, onClose, onDone }: ProjectModalProps) {
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [customerId, setCustomerId] = useState(project?.customer_id ?? '');
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    userService.getUsers().then((r) => setUsers(r.users ?? [])).catch(() => setUsers([]));
    const handler = (e: MouseEvent) => { if (userRef.current && !userRef.current.contains(e.target as Node)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredUsers = users.filter((u) =>
    userSearch ? u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.surname.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) : true
  );
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
        result = await projectService.createProject({ title: title.trim(), description: description.trim(), customer_id: customerId });
      } else {
        const input: UpdateProjectInput = {};
        if (title.trim() !== project.title) input.title = title.trim();
        if (description.trim() !== project.description) input.description = description.trim();
        if (customerId !== project.customer_id) input.customer_id = customerId;
        result = await projectService.updateProject(project.ID, input);
      }
      onDone(result);
    } catch (e) {
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
          <textarea className={`${inputCls} resize-none h-20`} placeholder="Descrizione opzionale" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Cliente" error={fieldErrors.customerId}>
          <div className="relative" ref={userRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
              <input
                className={`${inputCls} pl-8`}
                placeholder="Cerca per nome o email…"
                value={selectedUser && !showDropdown ? `${selectedUser.name} ${selectedUser.surname} (${selectedUser.email})` : userSearch}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => { setUserSearch(e.target.value); setCustomerId(''); setShowDropdown(true); }}
                autoComplete="new-password"
              />
              {customerId && (
                <button type="button" onClick={() => { setCustomerId(''); setUserSearch(''); setShowDropdown(true); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {showDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-[#18181B] border border-white/10 rounded-lg max-h-48 overflow-y-auto py-1">
                {filteredUsers.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-neutral-500">Nessun utente trovato</p>
                ) : (
                  filteredUsers.map((u) => (
                    <button key={u.ID} type="button" onClick={() => { setCustomerId(u.ID); setUserSearch(''); setShowDropdown(false); }}
                      className={`w-full flex flex-col px-3 py-2 text-left text-xs hover:bg-white/10 ${customerId === u.ID ? 'bg-white/8' : ''}`}>
                      <span className="font-medium text-white">{u.name} {u.surname}</span>
                      <span className="text-neutral-500">{u.email}</span>
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
          <Button type="submit" loading={submitting}>{mode === 'create' ? 'Crea Progetto' : 'Salva Modifiche'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function ToggleModal({ project, onClose, onDone }: { project: Project; onClose: () => void; onDone: (id: string) => void }) {
  const [toggling, setToggling] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const isActive = project.status;

  const handleToggle = async () => {
    setToggling(true);
    setApiError(null);
    try {
      await onDone(project.ID);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Errore durante la modifica');
      setToggling(false);
    }
  };

  return (
    <Modal title={isActive ? 'Disattiva Progetto' : 'Attiva Progetto'} onClose={onClose}>
      <div className="flex flex-col gap-5 p-6">
        <div className={`rounded-xl border p-4 flex gap-4 items-start ${isActive ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
          <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
            {isActive ? <PauseCircle className="w-5 h-5 text-amber-400" /> : <PlayCircle className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {isActive ? 'Vuoi disattivare ' : 'Vuoi attivare '}<span className="text-[#FF6900]">"{project.title}"</span>?
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {isActive ? 'Il progetto verrà segnato come inattivo.' : 'Il progetto verrà riattivato.'}
            </p>
          </div>
        </div>
        {apiError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{apiError}</p>}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/6 mt-2">
          <button type="button" onClick={onClose} disabled={toggling} className="px-4 h-9 text-sm font-medium text-neutral-400 hover:text-white bg-white/4 hover:bg-white/8 rounded-lg transition-colors disabled:opacity-50">Annulla</button>
          <button onClick={handleToggle} disabled={toggling} className={`px-4 h-9 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-700 hover:bg-emerald-600'}`}>
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
    } catch (e) {
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
            <p className="text-xs text-neutral-500 mt-1">Questa azione è irreversibile.</p>
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

function APIKeysModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [trustMode, setTrustMode] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    apiKeyService.list(project.ID)
      .then((data) => {
        if (!active) return;
        setKeys(data);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Errore nel caricamento');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => { active = false; };
  }, [project.ID]);

  const formatDate = (value?: string | null) => {
    if (!value) return 'Mai';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(date);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setNewKey(null);

    const input: CreateAPIKeyInput = {};
    if (label.trim()) input.label = label.trim();
    if (trustMode) input.trust_mode = true;
    if (expiresAt) input.expires_at = new Date(expiresAt).toISOString();

    try {
      const created: CreateAPIKeyResponse = await apiKeyService.create(project.ID, input);
      const createdKey: APIKey = {
        id: created.id,
        project_id: project.ID,
        label: created.label,
        trust_mode: created.trust_mode,
        created_at: created.created_at,
        expires_at: created.expires_at,
      };
      setKeys((prev) => [createdKey, ...prev]);
      setNewKey(created.key);
      setLabel('');
      setTrustMode(false);
      setExpiresAt('');
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Errore durante la creazione');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await apiKeyService.delete(project.ID, id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore durante la cancellazione');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyKey = async () => {
    if (!newKey) return;
    try { await navigator.clipboard.writeText(newKey); } catch { return; }
  };

  return (
    <Modal title={`API Keys • ${project.title}`} onClose={onClose}>
      <div className="flex flex-col gap-6 p-6">
        <div className="rounded-xl border border-white/10 bg-[#0B0B0B] p-4">
          <p className="text-xs text-white/50 mb-2">Project ID</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-white/70 break-all">{project.ID}</span>
            <button onClick={() => navigator.clipboard.writeText(project.ID).catch(() => {})} className="text-xs text-[#FF6900] hover:text-white transition-colors">Copia</button>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Etichetta">
              <input className={inputCls} placeholder="Es. Prod, Staging" value={label} onChange={(e) => setLabel(e.target.value)} />
            </Field>
            <Field label="Scadenza">
              <input className={inputCls} type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/2 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Trust mode</p>
              <p className="text-[11px] text-white/40">Disabilita rate limit per questa chiave</p>
            </div>
            <Toggle checked={trustMode} onChange={setTrustMode} />
          </div>
          {createError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{createError}</p>}
          <div className="flex items-center justify-end">
            <Button type="submit" loading={creating}>Crea API Key</Button>
          </div>
        </form>

        {newKey && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-xs text-emerald-300 mb-2">Nuova chiave generata (mostrata solo una volta)</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-emerald-100 break-all">{newKey}</span>
              <button onClick={handleCopyKey} className="text-xs text-emerald-300 hover:text-white transition-colors">Copia</button>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Chiavi esistenti</h3>
            <span className="text-xs text-white/40">{keys.length}</span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => {
              setLoading(true);
              setError(null);
              apiKeyService.list(project.ID)
                .then((data) => setKeys(data))
                .catch((e) => setError(e instanceof Error ? e.message : 'Errore nel caricamento'))
                .finally(() => setLoading(false));
            }} />
          ) : keys.length === 0 ? (
            <EmptyState message="Nessuna chiave" />
          ) : (
            <div className="flex flex-col gap-2">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-[#101010] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{key.label || 'Senza etichetta'}</p>
                    <p className="text-[11px] text-white/40 mt-1">
                      {key.trust_mode ? 'Trust mode' : 'Rate limit attivo'} • Creato {formatDate(key.created_at)} • Scadenza {formatDate(key.expires_at)}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(key.id)} disabled={deletingId === key.id} className="text-xs text-rose-400 hover:text-rose-200 transition-colors disabled:opacity-50">
                    {deletingId === key.id ? 'Elimino...' : 'Elimina'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
