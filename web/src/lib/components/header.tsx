import NotificationButton from './notificationButton';
import SearchBar from './searchBar';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  
  const formattedDate = new Intl.DateTimeFormat('it-IT', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(new Date());

  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };

  return (
    <header 
      className="
        my-4 z-40

        left-4 

        md:left-23 
        
        h-18
        flex items-center justify-between
        px-6


        bg-[#0A0A0A]/90 backdrop-blur-2xl saturate-150
        border border-white/10 
        shadow-2xl shadow-black/50
        rounded-xl
        
        transition-all duration-300 ease-out
      "
    >

      <div className="flex flex-col justify-center">
        <h1 className="text-lg font-semibold text-white tracking-tight leading-tight">
          Ciao, <span className="text-[#FF6900]">Matteo</span>
        </h1>
        <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
          {displayDate}
        </p>
      </div>


      <div className="hidden md:flex flex-1 justify-center px-8">
        <SearchBar 
           placeholder="Cerca comandi (⌘K)..." 
           className="w-full max-w-100"
        />
      </div>


      <div className="flex items-center gap-4">
        

        <div className="hidden sm:flex items-center gap-3">
           <NotificationButton />
           
           <button
             onClick={handleLogout}
             className="
               flex items-center justify-center
               w-10 h-10
               rounded-lg
               bg-white/5 hover:bg-white/10
               border border-white/10 hover:border-[#FF6900]/50
               text-white/60 hover:text-[#FF6900]
               transition-all duration-200
               group
             "
             title="Logout"
           >
             <svg 
               className="w-5 h-5" 
               fill="none" 
               viewBox="0 0 24 24" 
               stroke="currentColor"
             >
               <path 
                 strokeLinecap="round" 
                 strokeLinejoin="round" 
                 strokeWidth={2} 
                 d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
               />
             </svg>
           </button>
        </div>
      </div>
    </header>
  );
}