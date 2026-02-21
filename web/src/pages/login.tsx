import React, { useState } from 'react';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulazione API
    setTimeout(() => setIsLoading(false), 2000);
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


      <div 
        className="
          relative z-10 
          w-full max-w-105 mx-4
          p-8 md:p-10
          

          bg-[#0A0A0A]/80 backdrop-blur-2xl saturate-150
          border border-white/10 
          rounded-2xl
          shadow-2xl shadow-black/80
          
          flex flex-col gap-6
        "
      >

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-[#FF6900] to-[#FF4422] shadow-lg shadow-orange-500/20 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Accesso Dashboard</h2>
          <p className="text-sm text-white/40">Inserisci le tue credenziali per continuare</p>
        </div>


        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/60 ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white/20 group-focus-within:text-[#FF6900] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input 
                type="email" 
                required
                className="
                  block w-full pl-10 pr-4 py-3
                  bg-[#151515] border border-white/5
                  rounded-xl
                  text-sm text-white placeholder-white/20
                  focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A]
                  transition-all duration-200
                "
                placeholder="nome@azienda.com"
              />
            </div>
          </div>


          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold text-white/60">Password</label>
              <a href="#" className="text-[11px] text-[#FF6900] hover:text-[#ff8844] transition-colors">Recupera?</a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white/20 group-focus-within:text-[#FF6900] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                required
                className="
                  block w-full pl-10 pr-10 py-3
                  bg-[#151515] border border-white/5
                  rounded-xl
                  text-sm text-white placeholder-white/20
                  focus:ring-1 focus:ring-[#FF6900] focus:border-[#FF6900]/50 focus:outline-none focus:bg-[#0A0A0A]
                  transition-all duration-200
                "
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/20 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>


          <button
            type="submit"
            disabled={isLoading}
            className="
              relative w-full mt-4 h-11
              flex items-center justify-center
              bg-[#FF6900] hover:bg-[#ff7b1a] active:bg-[#e65e00]
              text-white text-sm font-semibold
              rounded-xl
              shadow-lg shadow-orange-500/20
              transition-all duration-200
              disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Accedi al sistema"
            )}
          </button>
        </form>


        <div className="relative flex py-2 items-center">
            <div className="grow border-t border-white/10"></div>
            <span className="shrink-0 mx-4 text-[10px] text-white/20 uppercase tracking-widest">Oppure</span>
            <div className="grow border-t border-white/10"></div>
        </div>


        <button className="
            flex items-center justify-center gap-3 w-full h-11
            bg-white/5 hover:bg-white/10 
            border border-white/5 hover:border-white/10
            rounded-xl text-white/80 text-sm font-medium
            transition-all duration-200
        ">
           <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
           </svg>
           Continua con Google
        </button>


        <p className="text-center text-xs text-white/30 mt-2">
          Non hai un account? <a href="#" className="text-white hover:underline">Contatta l'Admin</a>
        </p>
      </div>


      <div className="absolute bottom-6 text-[10px] text-white/20 font-mono">
        SECURE SYSTEM v2.4.0 • ENCRYPTED CONNECTION
      </div>
    </div>
  );
}