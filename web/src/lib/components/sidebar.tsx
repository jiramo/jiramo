import { Link, useLocation } from "react-router-dom";

interface MenuItem {
  id: string;
  label: string;
  path: string;
  iconPath: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "home",
    label: "Home",
    path: "/",
    iconPath:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    id: "projects",
    label: "Progetti",
    path: "/projects",
    iconPath:
      "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/analytics",
    iconPath:
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

const FOOTER_ITEMS: MenuItem[] = [
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    iconPath:
      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    id: "profile",
    label: "Profilo",
    path: "/profile",
    iconPath:
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className="hidden md:block w-25 shrink-0 h-screen" />

      <nav
        className="
          hidden md:flex 
          fixed left-4 z-50 top-4 bottom-4
          
          group flex-col justify-between overflow-hidden rounded-xl
          w-17 hover:w-60
          transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-[width]
          
          py-4 px-3
          bg-[#0A0A0A]/90 backdrop-blur-2xl saturate-150
          border border-white/10 ring-1 ring-black/50 shadow-2xl
        "
      >
        <div className="group flex items-center mb-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10">
              <img
                src="/logo.svg"
                alt="Logo"
                className="h-5 w-5 object-contain"
              />
            </div>
          </div>

          <span className="ml-2 whitespace-nowrap text-base font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-100">
            Jiramo
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {MENU_ITEMS.map((item) => (
            <DesktopNavItem
              key={item.id}
              {...item}
              active={isActive(item.path)}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-col gap-1 border-t border-white/5 pt-3">
          {FOOTER_ITEMS.map((item) => (
            <DesktopNavItem
              key={item.id}
              {...item}
              active={isActive(item.path)}
            />
          ))}
        </div>
      </nav>

      <nav
        className="
          flex md:hidden
          fixed bottom-6 left-4 right-4 z-50
          items-center justify-around
          
          h-18
          px-2
          
          rounded-2xl
          bg-[#0A0A0A]/85 backdrop-blur-2xl saturate-150
          border border-white/10
          shadow-[0_8px_32px_rgba(0,0,0,0.5)]
        "
      >
        {[...MENU_ITEMS, FOOTER_ITEMS[1]].map((item) => (
          <MobileNavItem
            key={item.id}
            active={isActive(item.path)}
            path={item.path}
            iconPath={item.iconPath}
            label={item.label}
          />
        ))}
      </nav>

      <div className="block md:hidden h-28 w-full" />
    </>
  );
}

function DesktopNavItem({
  label,
  active,
  path,
  iconPath,
}: {
  label: string;
  active?: boolean;
  path: string;
  iconPath: string;
}) {
  return (
    <Link
      to={path}
      className={`
        relative flex items-center rounded-lg transition-all duration-200 group/item h-10
        ${
          active
            ? "bg-[#FF6900]/10 border border-[#FF6900]/20"
            : "border border-transparent hover:bg-white/5"
        }
      `}
    >
      <div className="flex h-full w-11 shrink-0 items-center justify-center">
        <svg
          className={`h-5 w-5 transition-colors duration-200 ${active ? "text-[#FF6900]" : "text-white/50 group-hover/item:text-white"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <span
        className={`
          whitespace-nowrap text-sm font-medium opacity-0 -translate-x-2 
          group-hover:opacity-100 group-hover:translate-x-0 group-hover:delay-100 transition-all duration-300
          ${active ? "text-[#FF6900]" : "text-white/70"}
        `}
      >
        {label}
      </span>
      {active && (
        <div className="absolute inset-0 -z-10 rounded-lg bg-[#FF6900]/15 blur-md opacity-50" />
      )}
    </Link>
  );
}

function MobileNavItem({
  active,
  path,
  iconPath,
}: {
  active?: boolean;
  path: string;
  iconPath: string;
  label: string;
}) {
  return (
    <Link
      to={path}
      className="group relative flex flex-col items-center justify-center w-14 h-full"
    >
      {active && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#FF6900]/15 rounded-xl blur-md -z-10" />
      )}

      <div
        className={`
          flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
          ${
            active
              ? "bg-[#FF6900]/10 text-[#FF6900] scale-100 border border-[#FF6900]/20"
              : "text-white/40 hover:text-white hover:bg-white/5 active:scale-95 border border-transparent"
          }
        `}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
    </Link>
  );
}
