import { type LucideIcon } from "lucide-react";

interface NavItemProps {
  label: string;
  Icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ label, Icon, active, onClick }: NavItemProps) => {
  return (
    <button onClick={onClick}
      className={`group relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
        ${active ? "text-white bg-white/5" : "text-white/40 hover:text-white hover:bg-white/2"}`}>
      {active && (<div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[#FF6900] rounded-r-full shadow-[0_0_8px_#FF6900]" />)}

      <Icon size={20} strokeWidth={2} className={`transition-colors ${active ? "text-[#FF6900]" : "text-white/40 group-hover:text-white"}`} />

      <span className="truncate">{label}</span>
    </button>
  );
};

export default NavItem;