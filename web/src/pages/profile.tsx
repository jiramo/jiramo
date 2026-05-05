import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../lib/components/button';
import { ErrorAlert, ErrorState, Field, inputCls, LoadingScreen, Modal } from '../lib/components/ui';
import { profileService } from '../services/profileService';
import type { User } from '../types/user';
import { useAuth } from '../lib/auth';

export default function Profile() {
  const navigate = useNavigate();
  const { logout, refreshUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    profileService.getProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setName(data.name);
        setSurname(data.surname);
        setEmail(data.email);
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
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!profile) return;

    const updates: { name?: string; surname?: string; email?: string } = {};
    if (name.trim() && name.trim() !== profile.name) updates.name = name.trim();
    if (surname.trim() && surname.trim() !== profile.surname) updates.surname = surname.trim();
    if (email.trim() && email.trim() !== profile.email) updates.email = email.trim();

    if (Object.keys(updates).length === 0) {
      setError('Nessuna modifica da salvare');
      return;
    }

    setSaving(true);
    try {
      const updated = await profileService.updateProfile(updates);
      setProfile(updated);
      setSuccess('Profilo aggiornato');
      await refreshUser();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword.trim()) {
      setPasswordError('Inserisci la password corrente');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La nuova password deve avere almeno 6 caratteri');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Le password non coincidono');
      return;
    }

    setChangingPassword(true);
    try {
      await profileService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess('Password aggiornata');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Errore durante la modifica');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    setDeleteError(null);

    if (deleteConfirm.trim() !== profile.email) {
      setDeleteError('Conferma con la tua email');
      return;
    }

    setDeleting(true);
    try {
      await profileService.deleteProfile();
      logout();
      navigate('/login', { replace: true });
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Errore durante l\'eliminazione');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error && !profile) return <ErrorState message={error} onRetry={() => navigate(0)} />;

  return (
    <div className="w-full max-w-240 mx-auto p-6 md:p-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Profilo</h1>
        <p className="text-sm text-white/40 mt-1">Aggiorna le informazioni del tuo account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-[#0A0A0A]/60 p-6">
          <h2 className="text-lg font-semibold text-white">Dati personali</h2>
          <p className="text-xs text-white/40 mt-1">Modifica nome, cognome ed email</p>

          <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Cognome">
                <input className={inputCls} value={surname} onChange={(e) => setSurname(e.target.value)} />
              </Field>
            </div>
            <Field label="Email">
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>

            {error && <ErrorAlert message={error} />}
            {success && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>}

            <div className="flex justify-end">
              <Button type="submit" loading={saving}>Salva modifiche</Button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0A0A0A]/60 p-6">
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <p className="text-xs text-white/40 mt-1">Informazioni di accesso</p>

          <div className="mt-6 space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>ID</span>
              <span className="text-xs font-mono text-white/50 truncate max-w-40">{profile?.ID}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ruolo</span>
              <span className="text-xs uppercase tracking-widest text-[#FF6900]">{profile?.role}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-white/8 pt-4">
            <Button variant="outline" size="sm" onClick={() => setShowDelete(true)}>Elimina account</Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#0A0A0A]/60 p-6">
        <h2 className="text-lg font-semibold text-white">Sicurezza</h2>
        <p className="text-xs text-white/40 mt-1">Cambia la password del tuo account</p>

        <form onSubmit={handlePasswordChange} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Field label="Password corrente">
            <input className={inputCls} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </Field>
          <Field label="Nuova password">
            <input className={inputCls} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Field>
          <Field label="Conferma password">
            <input className={inputCls} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Field>

          <div className="md:col-span-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {passwordError && <p className="text-xs text-rose-400">{passwordError}</p>}
            {passwordSuccess && <p className="text-xs text-emerald-400">{passwordSuccess}</p>}
            <Button type="submit" loading={changingPassword}>Aggiorna password</Button>
          </div>
        </form>
      </div>

      {showDelete && (
        <Modal title="Conferma eliminazione" onClose={() => setShowDelete(false)}>
          <div className="p-6 flex flex-col gap-4">
            <p className="text-sm text-white/70">
              Per eliminare definitivamente l'account, inserisci la tua email e conferma.
            </p>
            <Field label="Email di conferma">
              <input className={inputCls} value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
            </Field>
            {deleteError && <p className="text-xs text-rose-400">{deleteError}</p>}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowDelete(false)} className="px-4 h-9 text-sm font-medium text-neutral-400 hover:text-white bg-white/4 hover:bg-white/8 rounded-lg transition-colors">Annulla</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 h-9 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors disabled:opacity-50">
                {deleting ? 'Elimino...' : 'Elimina'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
