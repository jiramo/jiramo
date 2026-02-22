import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SetupGuardProps {
  children: ReactNode;
}

export default function SetupGuard({ children }: SetupGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch('/setup/status');
        if (response.ok) {
          const data = await response.json();
          const ready = data.state === 'ready';

          console.log('Setup status:', data.state);

          if (!ready && location.pathname !== '/setup') {
            navigate('/setup', { replace: true });
          }
          else if (ready && location.pathname === '/setup') {
            console.log('Redirecting to /login');
            navigate('/login', { replace: true });
          }
        } else {
          console.error('Setup status check failed:', response.status);
        }
      } catch (error) {
        console.error('Errore nel controllo dello stato di setup:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkSetupStatus();
  }, [navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF6900] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
