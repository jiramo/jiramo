import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type SetupStep = 'db' | 'admin';

interface SetupStatusResponse {
  state: "no_db" | "no_admin" | "ready";
}

export default function Setup() {
  const [step, setStep] = useState<SetupStep>('db');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

    useEffect(() => {
    async function fetchSetupStatus() {
      try {
        const response = await fetch("/setup/status");
        if (!response.ok) {
          throw new Error(`Failed to fetch setup status: ${response.status}`);
        }

        const data: SetupStatusResponse = await response.json();

        switch (data.state) {
          case "no_db":
            setStep("db");
            break;
          case "no_admin":
            setStep("admin");
            break;
          case "ready":
            break;
          default:
            throw new Error(`Unknown app state: ${data.state}`);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSetupStatus();
  }, []);

  const handleDBSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      user: formData.get('user'),
      host: formData.get('host'),
      password: formData.get('password'),
      name: formData.get('name'),
      port: formData.get('port'),
    };

    try {
      const response = await fetch('/setup/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText || 'Error configuring database';
        
        if (errorMessage.toLowerCase().includes('connection')) {
          errorMessage += ' - Verifica che l\'host sia corretto (usa "postgres" in Docker)';
        }
        
        throw new Error(errorMessage);
      }

      setStep('admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      surname: formData.get('surname'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await fetch('/setup/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Errore nella creazione dell\'admin');
      }

      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden font-sans">
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-[#FF6900]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-4 p-8 md:p-10 bg-[#0A0A0A]/80 backdrop-blur-2xl saturate-150 border border-white/10 rounded-2xl shadow-2xl shadow-black/80 flex flex-col gap-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-[#FF6900] to-[#FF4422] shadow-lg shadow-[#FF6900]/20 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {step === 'db' ? 'Configurazione Database' : 'Creazione Amministratore'}
          </h2>
          <p className="text-sm text-white/40">
            {step === 'db' ? 'Configura la connessione al database PostgreSQL' : 'Crea l\'account amministratore iniziale'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${step === 'db' ? 'bg-[#FF6900]' : 'bg-[#FF6900]'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'admin' ? 'bg-[#FF6900]' : 'bg-white/20'}`} />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {step === 'db' ? (
          <form onSubmit={handleDBSubmit} className="flex flex-col gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-400 mb-2">
                💡 <strong>Con Docker:</strong> usa <strong>postgres</strong> (host), lascia la password <strong>vuota</strong>
              </p>
              <p className="text-xs text-blue-300">
                ℹ️ Il database verrà creato automaticamente. PostgreSQL è configurato in modalità trust (nessuna password richiesta).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 ml-1">Host</label>
                <input 
                  type="text" 
                  name="host"
                  required
                  defaultValue="postgres"
                  className="block w-full px-4 py-3 bg-[#151515] border border-white/5 rounded-xl text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A] transition-all duration-200"
                  placeholder="postgres"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 ml-1">Porta</label>
                <input 
                  type="text" 
                  name="port"
                  required
                  defaultValue="5432"
                  className="block w-full px-4 py-3 bg-[#151515] border border-white/5 rounded-xl text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A] transition-all duration-200"
                  placeholder="5432"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60 ml-1">Nome Database</label>
              <input 
                type="text" 
                name="name"
                required
                defaultValue="jiramo"
                className="block w-full px-4 py-3 bg-[#151515] border border-white/5 rounded-xl text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A] transition-all duration-200"
                placeholder="jiramo"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60 ml-1">Utente</label>
              <input 
                type="text" 
                name="user"
                required
                defaultValue="postgres"
                className="block w-full px-4 py-3 bg-[#151515] border border-white/5 rounded-xl text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A] transition-all duration-200"
                placeholder="postgres"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60 ml-1">Password (opzionale)</label>
              <input 
                type="password" 
                name="password"
                defaultValue=""
                className="block w-full px-4 py-3 bg-[#151515] border border-white/5 rounded-xl text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A] transition-all duration-200"
                placeholder="Lascia vuoto per trust mode"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3 mt-2 px-6 bg-linear-to-r from-[#FF6900] to-[#FF4422] text-white font-semibold rounded-xl shadow-lg shadow-[#FF6900]/25 hover:shadow-xl hover:shadow-[#FF6900]/40 focus:ring-2 focus:ring-[#FF6900] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Connessione...' : 'Connetti Database'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 ml-1">Nome</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="block w-full px-4 py-3 bg-[#151515] border border-white/5 rounded-xl text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A] transition-all duration-200"
                  placeholder="Mario"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 ml-1">Cognome</label>
                <input 
                  type="text" 
                  name="surname"
                  required
                  className="block w-full px-4 py-3 bg-[#151515] border border-white/5 rounded-xl text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A] transition-all duration-200"
                  placeholder="Rossi"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60 ml-1">Email</label>
              <input 
                type="email" 
                name="email"
                required
                className="block w-full px-4 py-3 bg-[#151515] border border-white/5 rounded-xl text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A] transition-all duration-200"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60 ml-1">Password (min 8 caratteri)</label>
              <input 
                type="password" 
                name="password"
                required
                minLength={8}
                className="block w-full px-4 py-3 bg-[#151515] border border-white/5 rounded-xl text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A] transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3 mt-2 px-6 bg-linear-to-r from-[#FF6900] to-[#FF4422] text-white font-semibold rounded-xl shadow-lg shadow-[#FF6900]/25 hover:shadow-xl hover:shadow-[#FF6900]/40 focus:ring-2 focus:ring-[#FF6900] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Creazione...' : 'Crea Amministratore'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
