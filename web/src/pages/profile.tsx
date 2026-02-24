import React, { useState } from "react";
import Button from "../lib/components/button";
import NavItem from "../components/NavItem";
import { Bell, CreditCard, Lock, Settings, User } from "lucide-react";


export default function Profile() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="w-full max-w-300 mx-auto p-4 md:p-8">

      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Impostazioni
        </h1>
        <p className="text-sm text-white/40 mt-2 max-w-md">
          Gestisci il tuo profilo, le preferenze e la sicurezza del tuo account.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col space-y-1 sticky top-24">
            <NavItem
              label="Generale"
              Icon={Settings}
              active={activeTab === "general"}
              onClick={() => setActiveTab("general")}
            />
            <NavItem
              label="Profilo Pubblico"
              Icon={User}
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
            <NavItem
              label="Notifiche"
              Icon={Bell}
              active={activeTab === "notifications"}
              onClick={() => setActiveTab("notifications")}
            />
            <NavItem
              label="Sicurezza & Accesso"
              Icon={Lock}
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
            />
            <div className="h-px bg-white/6 my-4 mx-3" />
            <NavItem
              label="Fatturazione"
              Icon={CreditCard}
              active={activeTab === "billing"}
              onClick={() => setActiveTab("billing")}
            />
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

          <section className="relative">

            <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#FF6900]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

            <div className="relative flex flex-col md:flex-row items-center gap-6 mb-8 z-10">

              <div className="relative group cursor-pointer shrink-0">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-linear-to-br from-[#FF6900] to-[#ff9100] flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-[#FF6900]/20 ring-4 ring-[#0A0A0A]">
                  MR
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                  <svg
                    className="w-8 h-8 text-white/80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold text-white">Matteo Rossi</h2>
                <p className="text-sm text-white/40 mb-3">
                  Developer • Milano, IT
                </p>
                <button className="text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 hover:text-white px-4 py-1.5 rounded-lg transition-colors border border-white/10">
                  Cambia foto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SettingsInput
                label="Nome"
                placeholder="Es: Matteo"
                defaultValue="Matteo"
              />
              <SettingsInput
                label="Cognome"
                placeholder="Es: Rossi"
                defaultValue="Rossi"
              />
              <SettingsInput
                label="Username"
                placeholder="@username"
                defaultValue="mrossi_dev"
                icon="at"
              />
              <SettingsSelect
                label="Ruolo Aziendale"
                options={[
                  "Front-end Developer",
                  "Back-end Developer",
                  "Product Manager",
                  "Designer",
                ]}
                defaultValue="Front-end Developer"
              />
            </div>

            <div className="mt-5">
              <SettingsTextArea
                label="Bio Pubblica"
                placeholder="Scrivi una breve descrizione..."
                rows={3}
              />
            </div>
          </section>


          <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent w-full" />


          <SettingsSection
            title="Preferenze & Localizzazione"
            description="Personalizza la tua esperienza sulla piattaforma."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SettingsSelect
                label="Lingua Interfaccia"
                options={["Italiano (IT)", "English (US)", "Español (ES)"]}
                defaultValue="Italiano (IT)"
              />
              <SettingsSelect
                label="Fuso Orario"
                options={[
                  "(GMT+01:00) Amsterdam, Berlin, Rome",
                  "(GMT+00:00) London",
                  "(GMT-05:00) Eastern Time",
                ]}
              />
            </div>
          </SettingsSection>


          <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent w-full" />


          <SettingsSection
            title="Notifiche"
            description="Scegli cosa ricevere via email e push."
          >
            <div className="space-y-2 bg-white/2 p-4 rounded-xl border border-white/5">
              <SettingsToggle
                label="Aggiornamenti di Progetto"
                description="Ricevi notifiche quando lo stato di un progetto cambia."
                defaultChecked={true}
              />
              <div className="h-px bg-white/5 mx-2" />
              <SettingsToggle
                label="Menzioni e Commenti"
                description="Notifica quando qualcuno ti tagga."
                defaultChecked={true}
              />
              <div className="h-px bg-white/5 mx-2" />
              <SettingsToggle
                label="Newsletter Marketing"
                description="Novità sul prodotto e offerte."
                defaultChecked={false}
              />
            </div>
          </SettingsSection>


          <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent w-full" />


          <div>
            <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-2">
              Zona Pericolosa
            </h3>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/4 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-medium text-white">
                  Elimina Account
                </h4>
                <p className="text-sm text-white/40 mt-0.5">
                  L'eliminazione è permanente e non può essere annullata. Tutti
                  i tuoi dati verranno rimossi.
                </p>
              </div>
              <button className="shrink-0 px-4 py-2 text-sm font-medium text-rose-300 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-all focus:ring-2 focus:ring-rose-500/50 focus:outline-none">
                Voglio eliminare l'account
              </button>
            </div>
          </div>


          <div className="sticky bottom-4 -mx-4 sm:mx-0 pt-4 mt-8 flex justify-end">
              <Button>Save</Button>
          </div>
        </main>
      </div>
    </div>
  );
}






const SettingsSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section>
    <div className="mb-6">
      <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-white/40 mt-1">{description}</p>
      )}
    </div>
    {children}
  </section>
);


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: "at" | "user"; 
}
const SettingsInput = ({ label, icon, className, ...props }: InputProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative group">

      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-white/20 group-focus-within:text-[#FF6900] transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {icon === "at" && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            )}
            {icon === "user" && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 110-8 4 4 0 010 8z"
              />
            )}
          </svg>
        </div>
      )}

      <input
        {...props}
        className={`
          block w-full py-3 ${icon ? "pl-10 pr-4" : "px-4"}

          bg-[#151515] border border-white/2 hover:border-white/5
          rounded-xl
          text-sm text-white placeholder-white/20 font-medium
          

          focus:border-[#FF6900]/50 focus:ring-1 focus:ring-[#FF6900]/30 focus:bg-[#0A0A0A] focus:outline-none
          focus:shadow-[0_0_15px_-3px_rgba(255,105,0,0.15)]

          transition-all duration-200 ease-out
          ${className}
        `}
      />
    </div>
  </div>
);


interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
const SettingsTextArea = ({ label, className, ...props }: TextAreaProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">
      {label}
    </label>
    <textarea
      {...props}
      className={`
          block w-full px-4 py-3
          bg-[#151515] border border-white/2 hover:border-white/5
          rounded-xl
          text-sm text-white placeholder-white/20 font-medium
          focus:border-[#FF6900]/50 focus:ring-1 focus:ring-[#FF6900]/30 focus:bg-[#0A0A0A] focus:outline-none
          focus:shadow-[0_0_15px_-3px_rgba(255,105,0,0.15)]
          resize-none transition-all duration-200 ease-out
          ${className}
        `}
    />
  </div>
);


const SettingsSelect = ({
  label,
  options,
  defaultValue,
}: {
  label: string;
  options: string[];
  defaultValue?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-white/50 ml-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative group">
      <select
        defaultValue={defaultValue}
        className="
          appearance-none block w-full px-4 py-3
          bg-[#151515] border border-white/2 hover:border-white/5
          rounded-xl
          text-sm text-white font-medium
          focus:border-[#FF6900]/50 focus:ring-1 focus:ring-[#FF6900]/30 focus:bg-[#0A0A0A] focus:outline-none
          focus:shadow-[0_0_15px_-3px_rgba(255,105,0,0.15)]
          cursor-pointer transition-all duration-200 ease-out
        "
      >
        {options.map((opt) => (
          <option key={opt} className="bg-[#1A1A1A] text-white">
            {opt}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/30 group-hover:text-white/50 transition-colors">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);


const SettingsToggle = ({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) => {
  const [enabled, setEnabled] = useState(defaultChecked || false);

  return (
    <div className="flex items-center justify-between group py-2">
      <div className="flex-1 pr-8">
        <p
          className={`text-sm font-medium transition-colors ${enabled ? "text-white" : "text-white/70"}`}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-white/30 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <button
        onClick={() => setEnabled(!enabled)}
        className={`
          relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF6900]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]
          ${enabled ? "bg-[#FF6900]" : "bg-white/10 group-hover:bg-white/20"}
        `}
      >

        <span
          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${enabled ? "opacity-100 shadow-[0_0_12px_rgba(255,105,0,0.5)]" : "opacity-0"}`}
        ></span>

        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 
            transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${enabled ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
};