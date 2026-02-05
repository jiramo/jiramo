import { useState, useRef, useEffect } from 'react';


type NotificationType = 'mention' | 'project' | 'system' | 'alert';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}


const MOCK_DATA: NotificationItem[] = [
  { id: '1', type: 'mention', title: 'Matteo ti ha menzionato', description: 'Dai un occhio alla nuova Dashboard.', time: '2m', unread: true },
  { id: '2', type: 'alert', title: 'Server Load High', description: 'CPU usage > 90% on instance-01.', time: '15m', unread: true },
  { id: '3', type: 'project', title: 'Deploy completato', description: 'Versione v2.4.0 online su main.', time: '1h', unread: false },
  { id: '4', type: 'system', title: 'Backup eseguito', description: 'Database salvato correttamente.', time: '3h', unread: false },
];

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_DATA);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="relative" ref={containerRef}>
      

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200
          ${isOpen ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}
        `}
      >
        <BellIcon className="w-5 h-5 hover:rotate-20 transition-transform duration-300" />
        

        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF4422] border-2 border-[#0A0A0A]"></span>
          </span>
        )}
      </button>


      {isOpen && (
        <div 
          className="
            absolute right-0 top-full mt-2 
            w-95 
            bg-[#0A0A0A] border border-white/10 rounded-xl 
            shadow-2xl shadow-black/50
            overflow-hidden z-50

            animate-in fade-in zoom-in-95 duration-100 ease-out origin-top-right
          "
        >
          

          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/2">
            <span className="text-sm font-medium text-white">Notifiche</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-xs text-[#FF6900] hover:text-[#FF8833] font-medium transition-colors"
              >
                Segna tutte lette
              </button>
            )}
          </div>


          <div className="max-h-80 overflow-y-auto py-1">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => markAsRead(item.id)}
                  className={`
                    relative flex gap-3 px-4 py-3 cursor-pointer transition-colors
                    hover:bg-white/5
                    ${item.unread ? 'bg-white/2' : 'opacity-60 hover:opacity-100'}
                  `}
                >

                  {item.unread && (
                    <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-[#FF6900] rounded-r-full" />
                  )}
                  

                  <div className="shrink-0 pt-0.5">
                    <StatusIcon type={item.type} />
                  </div>


                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className={`text-sm ${item.unread ? 'text-white font-medium' : 'text-white/90'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-white/40 whitespace-nowrap ml-2 mt-0.5">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-white/30 text-xs">
                Nessuna notifica recente
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function StatusIcon({ type }: { type: NotificationType }) {
  
  const colors = {
    mention: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    project: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    alert: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    system: "text-neutral-400 bg-neutral-400/10 border-white/10",
  };
  
  const paths = {
    mention: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    project: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    alert: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    system: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  };

  return (
    <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${colors[type]}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={paths[type]} />
      </svg>
    </div>
  );
}