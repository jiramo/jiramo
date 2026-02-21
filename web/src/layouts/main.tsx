import { Outlet } from 'react-router-dom';
import Sidebar from '../lib/components/sidebar';
import Header from '../lib/components/header';

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full bg-[#0A0A0A] text-white font-sans selection:bg-[#FF6900]/30">
      
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 relative z-0 pr-4">
        
        <Header />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
          
          <div className="h-24 md:h-8" />
        </div>

      </main>
    </div>
  )
}