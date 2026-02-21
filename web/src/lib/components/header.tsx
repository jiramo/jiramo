import NotificationButton from './notificationButton';
import SearchBar from './searchBar';

export default function Header() {
  
  const formattedDate = new Intl.DateTimeFormat('it-IT', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(new Date());

  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

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
        </div>
      </div>
    </header>
  );
}