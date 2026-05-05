import { useState, useRef, useEffect, useCallback } from 'react';
import Button from '../lib/components/button';
import { Modal, Field, inputCls, ErrorState, EmptyState, SkeletonCard, SkeletonList } from '../lib/components/ui';
import { userService } from '../services/userService';
import type { User, UpdateUserInput, UserRole } from '../types/user';

function fullName(user: User): string {
  return `${user.name} ${user.surname}`;
}

function initials(user: User): string {
  return `${user.name[0] ?? ''}${user.surname[0] ?? ''}`.toUpperCase();
}

function RoleBadge({ role }: { role: UserRole }) {
  const style = role === 'admin' ? 'text-[#FF6900] border-[#FF6900]/25 bg-[#FF6900]/10' : 'text-neutral-400 border-neutral-700 bg-neutral-800';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {role === 'admin' ? 'Admin' : 'Utente'}
    </span>
  );
}

function ViewIcon({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: 'grid' | 'list' }) {
  return (
    <button onClick={onClick} className={`p-2 rounded-md transition-colors ${active ? 'bg-[#27272A] text-white' : 'text-neutral-500 hover:text-white'}`}>
      {icon === 'grid' ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}

type RoleFilter = 'all' | 'user' | 'admin';

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data.users ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore nel caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreateDone = (created: User) => {
    setUsers((prev) => [created, ...prev]);
    setShowCreate(false);
  };

  const handleEditDone = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.ID === updated.ID ? updated : u)));
    setEditTarget(null);
  };

  const handleDeleteDone = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.ID !== id));
    setDeleteTarget(null);
  };

  const filteredUsers = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div className="w-full text-[#E5E5E5] font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 pb-6 border-b border-white/8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Utenti</h1>
          {!loading && !error && (
            <p className="text-sm text-neutral-500">{filteredUsers.length} utent{filteredUsers.length === 1 ? 'e' : 'i'}{roleFilter !== 'all' ? ` (${roleFilter})` : ''}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#121212] p-0.5 rounded-lg border border-white/8">
            {(['all', 'user', 'admin'] as RoleFilter[]).map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 h-8 rounded-md text-[11px] font-bold uppercase tracking-wide transition-colors ${roleFilter === r ? 'bg-[#27272A] text-white' : 'text-neutral-500 hover:text-white'}`}>
                {r === 'all' ? 'Tutti' : r === 'user' ? 'Utenti' : 'Admin'}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-white/8 mx-2" />
          <div className="flex bg-[#121212] p-0.5 rounded-lg border border-white/8">
            <ViewIcon active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon="grid" />
            <ViewIcon active={viewMode === 'list'} onClick={() => setViewMode('list')} icon="list" />
          </div>
          <div className="w-px h-6 bg-white/8 mx-2" />
          <Button leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>} onClick={() => setShowCreate(true)}>Nuovo Utente</Button>
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
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState message="Nessun cliente" action="Crea cliente" onAction={() => setShowCreate(true)} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <ClientCard key={u.ID} user={u} onEdit={() => setEditTarget(u)} onDelete={() => setDeleteTarget(u)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col rounded-xl border border-white/8 bg-[#09090B] overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 border-b border-white/8 bg-white/2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            <div className="col-span-4">Utente</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Ruolo</div>
            <div className="col-span-2 text-right">Azioni</div>
          </div>
          {filteredUsers.map((u) => (
            <ClientRow key={u.ID} user={u} onEdit={() => setEditTarget(u)} onDelete={() => setDeleteTarget(u)} />
          ))}
        </div>
      )}

      {showCreate && <UserModal mode="create" onClose={() => setShowCreate(false)} onDone={handleCreateDone} />}
      {editTarget && <UserModal mode="edit" user={editTarget} onClose={() => setEditTarget(null)} onDone={handleEditDone} />}
      {deleteTarget && <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onDone={handleDeleteDone} />}
    </div>
  );
}

function ClientCard({ user, onEdit, onDelete }: { user: User; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-[#09090B] border border-white/8 min-h-52">
      <div className="p-7">
        <div className="flex justify-between items-start mb-5">
          <div className="w-10 h-10 rounded-full bg-[#FF6900]/15 border border-[#FF6900]/25 flex items-center justify-center text-[#FF6900] text-sm font-bold">
            {initials(user)}
          </div>
          <RoleBadge role={user.role} />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">{fullName(user)}</h3>
        <p className="mt-1 text-sm text-neutral-500 truncate">{user.email}</p>
      </div>
      <div className="flex items-center justify-between px-5 py-4 bg-[#0E0E10] border-t border-white/6 rounded-b-xl">
        <span className="text-[10px] font-mono text-neutral-600 truncate max-w-[70%]">{user.ID}</span>
        <ClientDropdown onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}

function ClientRow({ user, onEdit, onDelete }: { user: User; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="grid grid-cols-12 items-center px-6 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
      <div className="col-span-4 flex items-center gap-3 pr-4">
        <div className="w-8 h-8 rounded-full bg-[#FF6900]/15 border border-[#FF6900]/25 flex items-center justify-center text-[#FF6900] text-[10px] font-bold shrink-0">
          {initials(user)}
        </div>
        <span className="text-sm font-bold text-white tracking-tight truncate">{fullName(user)}</span>
      </div>
      <div className="col-span-4 pr-4">
        <span className="text-sm text-neutral-500 truncate block">{user.email}</span>
      </div>
      <div className="col-span-2"><RoleBadge role={user.role} /></div>
      <div className="col-span-2 flex justify-end"><ClientDropdown onEdit={onEdit} onDelete={onDelete} /></div>
    </div>
  );
}

function ClientDropdown({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 z-50 bg-[#18181B] border border-white/10 rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.9)] py-1">
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left text-neutral-300 hover:bg-white/10 hover:text-white">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>Modifica
          </button>
          <div className="h-px bg-white/8 my-1 mx-2" />
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left text-rose-500 hover:bg-rose-500/10">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>Elimina
          </button>
        </div>
      )}
    </div>
  );
}

type UserModalProps = { mode: 'create'; user?: undefined; onClose: () => void; onDone: (u: User) => void } | { mode: 'edit'; user: User; onClose: () => void; onDone: (u: User) => void };

function UserModal({ mode, user, onClose, onDone }: UserModalProps) {
  const [name, setName] = useState(user?.name ?? '');
  const [surname, setSurname] = useState(user?.surname ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'user');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Minimo 2 caratteri';
    if (!surname.trim() || surname.trim().length < 2) errs.surname = 'Minimo 2 caratteri';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email non valida';
    if (mode === 'create' && password.length < 6) errs.password = 'Minimo 6 caratteri';
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
      let result: User;
      if (mode === 'create') {
        result = await userService.createUser({ name: name.trim(), surname: surname.trim(), email: email.trim(), password, role });
      } else {
        const input: UpdateUserInput = {};
        if (name.trim() !== user.name) input.name = name.trim();
        if (surname.trim() !== user.surname) input.surname = surname.trim();
        if (email.trim() !== user.email) input.email = email.trim();
        if (role !== user.role) input.role = role;
        result = await userService.updateUser(user.ID, input);
      }
      onDone(result);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Errore imprevisto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={mode === 'create' ? 'Nuovo Cliente' : 'Modifica Cliente'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome" error={fieldErrors.name}>
            <input className={inputCls} placeholder="Mario" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
          <Field label="Cognome" error={fieldErrors.surname}>
            <input className={inputCls} placeholder="Rossi" value={surname} onChange={(e) => setSurname(e.target.value)} />
          </Field>
        </div>
        <Field label="Email" error={fieldErrors.email}>
          <input className={inputCls} type="email" placeholder="mario.rossi@esempio.it" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        {mode === 'create' && (
          <Field label="Password" error={fieldErrors.password}>
            <input className={inputCls} type="password" placeholder="Minimo 6 caratteri" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
        )}
        <Field label="Ruolo">
          <select className={`${inputCls} appearance-none`} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="user">Utente</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        {apiError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{apiError}</p>}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/6 mt-2">
          <button type="button" onClick={onClose} className="px-4 h-9 text-sm font-medium text-neutral-400 hover:text-white bg-white/4 hover:bg-white/8 rounded-lg transition-colors">Annulla</button>
          <Button type="submit" loading={submitting}>{mode === 'create' ? 'Crea Cliente' : 'Salva Modifiche'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({ user, onClose, onDone }: { user: User; onClose: () => void; onDone: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setApiError(null);
    try {
      await userService.deleteUser(user.ID);
      onDone(user.ID);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Errore durante l'eliminazione");
      setDeleting(false);
    }
  };

  return (
    <Modal title="Elimina Cliente" onClose={onClose}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex gap-4 items-start">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Sei sicuro di voler eliminare <span className="text-[#FF6900]">"{fullName(user)}"</span>?</p>
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
