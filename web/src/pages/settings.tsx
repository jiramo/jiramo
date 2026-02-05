import { useState } from 'react';
import Button from '../lib/components/button';

export default function DashboardSettings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="w-full max-w-300 mx-auto p-4 md:p-8">
      

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Impostazioni Workspace</h1>
            <p className="text-sm text-white/40 mt-2">
            Gestisci la configurazione globale, il team e le integrazioni di <span className="text-white font-medium">Acme Corp</span>.
            </p>
        </div>
        <div className="flex gap-3">
             <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                Piano Business
             </span>
             <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium border border-blue-500/20">
                v2.4.0
             </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        

        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col space-y-1 sticky top-24">
            <NavItem label="Generale" icon="building" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
            <NavItem label="Membri del Team" icon="users" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
            <NavItem label="API & Integrazioni" icon="code" active={activeTab === 'api'} onClick={() => setActiveTab('api')} />
            <NavItem label="Fatturazione" icon="card" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
            <div className="h-px bg-white/6 my-4 mx-3" />
            <NavItem label="Audit Logs" icon="clipboard" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          </nav>
        </aside>


        <main 
          className="
            flex-1 
            bg-[#0A0A0A]/60 backdrop-blur-xl 
            border border-white/8 rounded-2xl 
            shadow-2xl shadow-black/50
            p-6 md:p-8
            space-y-10
            animate-in fade-in slide-in-from-bottom-2 duration-300
          "
        >
          

          {activeTab === 'general' && (
            <div className="space-y-10">
                <section className="relative">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="h-20 w-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">

                            <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Logo Workspace</h3>
                            <p className="text-sm text-white/40 mb-3">Consigliato 400x400px.</p>
                            <button className="text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/10">
                                Carica Logo
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <SettingsInput label="Nome Workspace" defaultValue="Acme Corp" />
                        <SettingsInput label="URL Slug" defaultValue="acme-corp" prefix="jiramo.app/" />
                        <SettingsSelect label="Settore" options={['Software House', 'E-commerce', 'Fintech', 'Education']} defaultValue="Software House" />
                        <SettingsInput label="Email di Supporto" defaultValue="help@acme.com" icon="at" />
                    </div>
                </section>

                <div className="h-px bg-white/5 w-full" />

                <SettingsSection title="Visibilità & Accesso">
                    <div className="space-y-2 bg-white/2 p-4 rounded-xl border border-white/5">
                        <SettingsToggle label="Modalità Manutenzione" description="Blocca l'accesso ai membri non-admin." defaultChecked={false} />
                        <div className="h-px bg-white/5 mx-2" />
                        <SettingsToggle label="Consenti Inviti Pubblici" description="Permetti agli utenti di invitare altri membri tramite link." defaultChecked={true} />
                        <div className="h-px bg-white/5 mx-2" />
                        <SettingsToggle label="Richiedi 2FA" description="Forza l'autenticazione a due fattori per tutti." defaultChecked={true} />
                    </div>
                </SettingsSection>
            </div>
          )}


          {activeTab === 'api' && (
              <div className="space-y-8">
                  <SettingsSection title="Chiavi API" description="Gestisci le chiavi per l'accesso programmatico.">
                      <div className="space-y-4">
                          <div className="bg-[#151515] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 group hover:border-white/10 transition-colors">
                              <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Production Key</div>
                                  <div className="font-mono text-sm text-white truncate opacity-70">pk_live_51Mxz...92xLz</div>
                              </div>
                              <button className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              </button>
                          </div>
                          <button className="w-full py-3 border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/40 hover:bg-white/2 rounded-xl text-sm font-medium transition-all">
                              + Genera Nuova Chiave
                          </button>
                      </div>
                  </SettingsSection>
                  
                  <div className="h-px bg-white/5 w-full" />

                  <SettingsSection title="Webhooks">
                      <SettingsInput label="Endpoint URL" placeholder="https://api.tuosito.com/webhooks" />
                  </SettingsSection>
              </div>
          )}


          {activeTab === 'team' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white">3 Membri Attivi</h3>
                      <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#FF6900] hover:text-white transition-colors">
                          Invita Utente
                      </button>
                  </div>
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                      <TeamRow name="Matteo Rossi" email="m.rossi@acme.com" role="Admin" />
                      <TeamRow name="Giulia Bianchi" email="g.bianchi@acme.com" role="Editor" />
                      <TeamRow name="Luca Verdi" email="l.verdi@acme.com" role="Viewer" />
                  </div>
              </div>
          )}


          <div className="sticky bottom-4 -mx-4 sm:mx-0 pt-4 mt-8 flex justify-end pointer-events-none">
                <Button>Save</Button>
          </div>

        </main>
      </div>
    </div>
  );
}


const SettingsSection = ({ title, description, children }: any) => (
  <section>
    <div className="mb-5">
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      {description && <p className="text-xs text-white/40 mt-1">{description}</p>}
    </div>
    {children}
  </section>
);

const SettingsInput = ({ label, icon, prefix, className, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">{label}</label>
    <div className="relative group flex items-center">
      {prefix && (
          <div className="pl-4 pr-1 py-3 bg-[#151515] border-y border-l border-white/2 rounded-l-xl text-white/30 text-sm font-mono border-r-0">
              {prefix}
          </div>
      )}
      <input 
        {...props}
        className={`
          block w-full py-3 ${icon ? 'pl-10 pr-4' : 'px-4'}
          bg-[#151515] border border-white/2 hover:border-white/5
          ${prefix ? 'rounded-r-xl border-l-0' : 'rounded-xl'}
          text-sm text-white placeholder-white/20 font-medium
          focus:border-[#FF6900]/50 focus:ring-1 focus:ring-[#FF6900]/30 focus:bg-[#0A0A0A] focus:outline-none
          transition-all duration-200 ease-out
          ${className}
        `}
      />
       {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <svg className="h-4 w-4 text-white/20 group-focus-within:text-[#FF6900] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 {icon === 'at' && <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />}
             </svg>
          </div>
      )}
    </div>
  </div>
);

const SettingsSelect = ({ label, options, defaultValue }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">{label}</label>
    <div className="relative group">
      <select 
        defaultValue={defaultValue}
        className="
          appearance-none block w-full px-4 py-3
          bg-[#151515] border border-white/2 hover:border-white/5
          rounded-xl
          text-sm text-white font-medium
          focus:border-[#FF6900]/50 focus:ring-1 focus:ring-[#FF6900]/30 focus:bg-[#0A0A0A] focus:outline-none
          cursor-pointer transition-all duration-200 ease-out
        "
      >
        {options.map((opt:string) => <option key={opt} className="bg-[#1A1A1A] text-white">{opt}</option>)}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/30 group-hover:text-white/50 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const SettingsToggle = ({ label, description, defaultChecked }: any) => {
  const [enabled, setEnabled] = useState(defaultChecked || false);
  return (
    <div className="flex items-center justify-between group py-2">
      <div className="flex-1 pr-8">
        <p className={`text-sm font-medium transition-colors ${enabled ? 'text-white' : 'text-white/70'}`}>{label}</p>
        {description && <p className="text-xs text-white/30 mt-1 leading-relaxed">{description}</p>}
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`
          relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-300 ease-in-out focus:outline-none
          ${enabled ? 'bg-[#FF6900]' : 'bg-white/10 group-hover:bg-white/20'}
        `}
      >
        <span className={`absolute inset-0 rounded-full transition-opacity duration-300 ${enabled ? 'opacity-100 shadow-[0_0_12px_rgba(255,105,0,0.5)]' : 'opacity-0'}`}></span>
        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
      </button>
    </div>
  );
};

const TeamRow = ({ name, email, role }: any) => (
    <div className="flex items-center justify-between p-4 bg-[#151515] border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-neutral-700 to-neutral-600 flex items-center justify-center text-xs font-bold text-white">
                {name.charAt(0)}
            </div>
            <div>
                <p className="text-sm font-medium text-white">{name}</p>
                <p className="text-xs text-white/40">{email}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-white/60 bg-white/5 px-2 py-1 rounded border border-white/5">{role}</span>
            <button className="text-white/20 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
        </div>
    </div>
)

const NavItem = ({ label, icon, active, onClick }: any) => {
    const icons: any = {
        building: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        users: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
        code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
        card: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
        clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    };

    return (
        <button 
            onClick={onClick}
            className={`
                group relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                ${active 
                    ? 'text-white bg-white/5' 
                    : 'text-white/40 hover:text-white hover:bg-white/2'}
            `}
        >
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[#FF6900] rounded-r-full shadow-[0_0_8px_#FF6900]" />}
            
            <svg className={`w-5 h-5 transition-colors ${active ? 'text-[#FF6900]' : 'text-white/40 group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icons[icon]} />
            </svg>
            <span className="truncate">{label}</span>
        </button>
    )
}