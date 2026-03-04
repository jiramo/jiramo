import { useState, useRef, useEffect, useCallback } from 'react';
import React from 'react';
import Button from '../lib/components/button';
import { userService } from '../services/userService';
import type { User, CreateUserInput, UpdateUserInput, UserRole } from '../types/user';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fullName(user: User): string {
  return `${user.name} ${user.surname}`;
}

function initials(user: User): string {
  return `${user.name[0] ?? ''}${user.surname[0] ?? ''}`.toUpperCase();
}

// ─── Main Page ───────────────────────────────────────────────────────────────

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore nel caricamento degli utenti');
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
    <div className="w-full text-[#E5E5E5] font-sans selection:bg-white/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 pb-6 border-b border-white/8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Utenti</h1>
          {!loading && !error && (
            <p className="text-sm text-neutral-500">
              {filteredUsers.length} utent{filteredUsers.length === 1 ? 'e' : 'i'}{roleFilter !== 'all' ? ` (${roleFilter})` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#121212] p-0.5 rounded-lg border border-white/8">
            {(['all', 'user', 'admin'] as RoleFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 h-8 rounded-md text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  roleFilter === r ? 'bg-[#27272A] text-white shadow-sm' : 'text-neutral-500 hover:text-white'
                }`}
              >
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
          <Button
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
            onClick={() => setShowCreate(true)}
          >
            Nuovo Utente
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState onNew={() => setShowCreate(true)} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <ClientCard
              key={u.ID}
              data={u}
              onEdit={() => setEditTarget(u)}
              onDelete={() => setDeleteTarget(u)}
            />
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
            <ClientRow
              key={u.ID}
              data={u}
              onEdit={() => setEditTarget(u)}
              onDelete={() => setDeleteTarget(u)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <UserModal mode="create" onClose={() => setShowCreate(false)} onDone={handleCreateDone} />
      )}
      {editTarget && (
        <UserModal
          mode="edit"
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onDone={handleEditDone}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDone={handleDeleteDone}
        />
      )}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

const ClientCard = ({
  data,
  onEdit,
  onDelete,
}: {
  data: User;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="flex flex-col justify-between rounded-xl overflow-visible bg-[#09090B] border border-white/8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] min-h-52 relative">
    <div className="p-7">
      <div className="flex justify-between items-start mb-5">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#FF6900]/15 border border-[#FF6900]/25 flex items-center justify-center text-[#FF6900] text-sm font-bold tracking-wide select-none">
          {initials(data)}
        </div>
        <RoleBadge role={data.role} />
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
        {fullName(data)}
      </h3>
      <p className="mt-1 text-sm text-neutral-500 truncate">{data.email}</p>
    </div>
    <div className="flex items-center justify-between px-5 py-4 bg-[#0E0E10] border-t border-white/6 rounded-b-xl">
      <span className="text-[10px] font-mono text-neutral-600 truncate max-w-[70%]">
        {data.ID}
      </span>
      <DropdownMenu onEdit={onEdit} onDelete={onDelete} />
    </div>
  </div>
);

// ─── Row ─────────────────────────────────────────────────────────────────────

const ClientRow = ({
  data,
  onEdit,
  onDelete,
}: {
  data: User;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="grid grid-cols-12 items-center px-6 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
    <div className="col-span-4 flex items-center gap-3 pr-4">
      <div className="w-8 h-8 rounded-full bg-[#FF6900]/15 border border-[#FF6900]/25 flex items-center justify-center text-[#FF6900] text-[10px] font-bold shrink-0 select-none">
        {initials(data)}
      </div>
      <span className="text-sm font-bold text-white tracking-tight truncate">
        {fullName(data)}
      </span>
    </div>
    <div className="col-span-4 pr-4">
      <span className="text-sm text-neutral-500 truncate block">{data.email}</span>
    </div>
    <div className="col-span-2">
      <RoleBadge role={data.role} />
    </div>
    <div className="col-span-2 flex justify-end">
      <DropdownMenu onEdit={onEdit} onDelete={onDelete} />
    </div>
  </div>
);

// ─── Dropdown ────────────────────────────────────────────────────────────────

const DropdownMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-md transition-colors ${isOpen ? 'bg-white text-black' : 'text-neutral-400 hover:text-white active:bg-white/10'}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 z-50 bg-[#18181B] border border-white/10 rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.9)] py-1 overflow-hidden">
          <MenuItem
            label="Modifica"
            icon="cog"
            onClick={() => { onEdit(); setIsOpen(false); }}
          />
          <div className="h-px bg-white/8 my-1 mx-2" />
          <MenuItem
            label="Elimina"
            icon="trash"
            destructive
            onClick={() => { onDelete(); setIsOpen(false); }}
          />
        </div>
      )}
    </div>
  );
};

const MenuItem = ({
  label,
  icon,
  destructive,
  onClick,
}: {
  label: string;
  icon: string;
  destructive?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-left transition-colors ${
      destructive
        ? 'text-rose-500 hover:bg-rose-500/10'
        : 'text-neutral-300 hover:bg-white/10 hover:text-white'
    }`}
  >
    <span className="opacity-70">
      {icon === 'cog' && (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
      {icon === 'trash' && (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </span>
    {label}
  </button>
);

// ─── Role Badge ───────────────────────────────────────────────────────────────

const RoleBadge = ({ role }: { role: UserRole }) => {
  const style =
    role === 'admin'
      ? 'text-[#FF6900] border-[#FF6900]/25 bg-[#FF6900]/10'
      : 'text-neutral-400 border-neutral-700 bg-neutral-800';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {role === 'admin' ? 'Admin' : 'Utente'}
    </span>
  );
};

// ─── View Icon ───────────────────────────────────────────────────────────────

const ViewIcon = ({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: 'grid' | 'list';
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-md transition-colors ${active ? 'bg-[#27272A] text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {icon === 'grid' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  </button>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const LoadingSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col rounded-xl border border-white/8 bg-[#09090B] overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 items-center px-6 py-4 border-b border-white/4 last:border-0 animate-pulse"
          >
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5" />
              <div className="h-4 bg-white/5 rounded w-32" />
            </div>
            <div className="col-span-4 h-3 bg-white/5 rounded w-40" />
            <div className="col-span-2 h-5 bg-white/5 rounded w-16" />
            <div className="col-span-2 flex justify-end">
              <div className="h-8 w-8 bg-white/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-[#09090B] border border-white/8 min-h-52 animate-pulse"
        >
          <div className="p-7 space-y-4">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 rounded-full bg-white/5" />
              <div className="h-5 w-14 bg-white/5 rounded" />
            </div>
            <div className="h-6 w-3/4 bg-white/5 rounded" />
            <div className="h-3 w-1/2 bg-white/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Error / Empty States ─────────────────────────────────────────────────────

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
    <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
      <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <div>
      <p className="text-sm font-medium text-white">Errore nel caricamento</p>
      <p className="text-xs text-neutral-500 mt-1">{message}</p>
    </div>
    <button
      onClick={onRetry}
      className="text-xs text-[#FF6900] hover:text-white transition-colors underline underline-offset-2"
    >
      Riprova
    </button>
  </div>
);

const EmptyState = ({ onNew }: { onNew: () => void }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
    <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center">
      <svg className="w-6 h-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <div>
      <p className="text-sm font-medium text-white">Nessun cliente</p>
      <p className="text-xs text-neutral-500 mt-1">Crea il primo cliente per iniziare</p>
    </div>
    <button
      onClick={onNew}
      className="text-xs text-[#FF6900] hover:text-white transition-colors underline underline-offset-2"
    >
      Crea cliente
    </button>
  </div>
);

// ─── Modal base ───────────────────────────────────────────────────────────────

const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
        <button
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/8 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-[11px] text-rose-400">{error}</p>}
  </div>
);

const inputCls =
  'w-full px-3 py-2.5 bg-[#121212] border border-white/8 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF6900]/60 focus:ring-1 focus:ring-[#FF6900]/30 transition-colors';

// ─── User Modal (create / edit) ───────────────────────────────────────────────

type UserModalProps =
  | { mode: 'create'; user?: undefined; onClose: () => void; onDone: (u: User) => void }
  | { mode: 'edit'; user: User; onClose: () => void; onDone: (u: User) => void };

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
        const input: CreateUserInput = {
          name: name.trim(),
          surname: surname.trim(),
          email: email.trim(),
          password,
          role,
        };
        result = await userService.createUser(input);
      } else {
        const input: UpdateUserInput = {};
        if (name.trim() !== user.name) input.name = name.trim();
        if (surname.trim() !== user.surname) input.surname = surname.trim();
        if (email.trim() !== user.email) input.email = email.trim();
        if (role !== user.role) input.role = role;
        result = await userService.updateUser(user.ID, input);
      }
      onDone(result);
    } catch (e: unknown) {
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
            <input
              className={inputCls}
              placeholder="Mario"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Cognome" error={fieldErrors.surname}>
            <input
              className={inputCls}
              placeholder="Rossi"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Email" error={fieldErrors.email}>
          <input
            className={inputCls}
            type="email"
            placeholder="mario.rossi@esempio.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        {mode === 'create' && (
          <Field label="Password" error={fieldErrors.password}>
            <input
              className={inputCls}
              type="password"
              placeholder="Minimo 6 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        )}

        <Field label="Ruolo">
          <select
            className={`${inputCls} appearance-none`}
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="user">Utente</option>
            <option value="admin">Admin</option>
          </select>
        </Field>

        {apiError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {apiError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/6 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 text-sm font-medium text-neutral-400 hover:text-white bg-white/4 hover:bg-white/8 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            {mode === 'create' ? 'Crea Cliente' : 'Salva Modifiche'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({
  user,
  onClose,
  onDone,
}: {
  user: User;
  onClose: () => void;
  onDone: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setApiError(null);
    try {
      await userService.deleteUser(user.ID);
      onDone(user.ID);
    } catch (e: unknown) {
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
            <p className="text-sm font-medium text-white">
              Sei sicuro di voler eliminare{' '}
              <span className="text-[#FF6900]">"{fullName(user)}"</span>?
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Questa azione è irreversibile e rimuoverà il cliente definitivamente.
            </p>
          </div>
        </div>

        {apiError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {apiError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/6 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 h-9 text-sm font-medium text-neutral-400 hover:text-white bg-white/4 hover:bg-white/8 rounded-lg transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 h-9 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleting && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Elimina
          </button>
        </div>
      </div>
    </Modal>
  );
}
