import { useBreakpointValues } from '../hooks/useResponsive'

const icons = {
  search: (
    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  notification: (
    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  logo: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.43323e-05 23.4634C3.43323e-05 24.568 0.896952 25.4716 1.99812 25.385C8.02024 24.9112 13.7033 22.3075 18.0054 18.0054C22.3075 13.7032 24.9112 8.02021 25.385 1.99809C25.4716 0.896919 24.568 3.8147e-06 23.4635 1.90735e-06H14.7317C13.6272 1.90735e-06 12.7478 0.900923 12.575 1.99189C12.157 4.63064 10.9157 7.0897 9.00271 9.00268C7.08973 10.9157 4.63067 12.157 1.99192 12.575C0.900957 12.7478 3.62396e-05 13.6271 3.62396e-05 14.7317L3.43323e-05 23.4634Z" fill="#F3EEDF"/>
      <path d="M36 12.5366C36 11.432 35.1031 10.5284 34.002 10.615C27.9798 11.0888 22.2968 13.6925 17.9947 17.9946C13.6926 22.2968 11.0889 27.9798 10.6151 34.0019C10.5284 35.1031 11.4321 36 12.5366 36H21.2683C22.3729 36 23.2523 35.0991 23.4251 34.0081C23.843 31.3694 25.0844 28.9103 26.9974 26.9973C28.9103 25.0843 31.3694 23.843 34.0081 23.425C35.0991 23.2522 36 22.3729 36 21.2683V12.5366Z" fill="#F3EEDF"/>
    </svg>
  ),
  moreOptions: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  ),
  listView: (
    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  gridView: (
    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  plus: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
}

// Responsive breakpoint configurations
const responsiveConfig = {
  headerLayout: { mobile: 'flex flex-col items-stretch gap-3', tablet: 'flex flex-row items-center gap-0', desktop: 'flex flex-row items-center gap-0' },
  headerTitle: { mobile: 'text-lg', tablet: 'text-xl', desktop: 'text-xl' },
  headerSearch: { mobile: 'px-3 py-2.5', tablet: 'px-3 py-2', desktop: 'px-3 py-2' },
  statCard: { mobile: 'flex-[1_1_calc(50%-8px)] min-w-[130px] p-3.5', tablet: 'flex-[1_1_calc(25%-12px)] min-w-[150px] p-4', desktop: 'flex-[1_1_calc(25%-12px)] min-w-[200px] p-5' },
  statFont: { mobile: 'text-base', tablet: 'text-lg', desktop: 'text-2xl' },
  statTitle: { mobile: 'text-[10px]', tablet: 'text-[11px]', desktop: 'text-xs' },
  projectCard: { mobile: 'min-w-[260px] max-w-full p-4 text-base gap-1.5', tablet: 'min-w-[280px] max-w-[350px] p-5 text-lg gap-2', desktop: 'min-w-[280px] max-w-[350px] p-6 text-xl gap-2.5' },
  deploymentRow: { mobile: 'flex flex-col items-stretch gap-2 p-3', tablet: 'flex flex-row items-center gap-0 py-4 px-4', desktop: 'flex flex-row items-center gap-0 py-4 px-4' },
  overviewPadding: { mobile: 'p-4', tablet: 'p-5', desktop: 'p-8' },
  statsContainer: { mobile: 'flex flex-row flex-wrap gap-3 justify-start', tablet: 'flex flex-row flex-wrap gap-4 justify-start', desktop: 'flex flex-row flex-nowrap gap-4 justify-between' },
  recentsContainer: { mobile: 'flex flex-col gap-4 items-stretch', tablet: 'flex flex-row gap-4 items-stretch flex-wrap', desktop: 'flex flex-row gap-4 items-stretch flex-wrap' },
  deploymentHeader: { mobile: 'flex flex-col items-start gap-3', tablet: 'flex flex-row items-center gap-0', desktop: 'flex flex-row items-center gap-0' },
}

function Header() {
  const headerConfig = useBreakpointValues(responsiveConfig.headerLayout)
  const titleConfig = useBreakpointValues(responsiveConfig.headerTitle)
  const searchConfig = useBreakpointValues(responsiveConfig.headerSearch)

  return (
    <header className={`flex justify-between bg-dark-800 border-b border-dark-500 ${headerConfig} p-4 md:px-6 lg:px-8`}>
      <h1 className={`font-medium text-white mb-0 ${titleConfig}`}>Welcome back Marco</h1>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className={`flex items-center bg-dark-500 rounded-lg border border-dark-200 w-full max-w-[280px] md:max-w-[360px] lg:max-w-[450px] ${searchConfig}`}>
          {icons.search}
          <span className="text-gray-500 ml-3 text-sm flex-1">Search</span>
          <span className="text-gray-600 text-xs border border-dark-200 rounded px-1.5 py-0.5">Ctrl K</span>
        </div>

        <button className="w-10 h-10 rounded-lg bg-dark-500 border border-dark-200 flex items-center justify-center cursor-pointer shrink-0 hover:border-gray-600 transition-colors">
          {icons.notification}
        </button>
      </div>
    </header>
  )
}

function StatCard() {
  const cardClasses = useBreakpointValues(responsiveConfig.statCard)
  const fontClasses = useBreakpointValues(responsiveConfig.statFont)
  const titleClasses = useBreakpointValues(responsiveConfig.statTitle)

  return (
    <div className={`bg-dark-600 rounded-xl border border-dark-300 flex flex-col ${cardClasses}`}>
      <p className={`text-gray-500 uppercase tracking-wider mb-3 truncate ${titleClasses}`}>
        Total Revenue
      </p>
      <p className={`font-semibold text-white mb-4 leading-tight ${fontClasses}`}>€ 24,500</p>
      <div className="w-full h-1 bg-dark-200 rounded-full mt-auto">
        <div className="w-3/5 h-full bg-accent-orange rounded-full" />
      </div>
    </div>
  )
}

function ProjectCard({ title, author, tags, status, borderColor }: { title: string; author: string; tags: string[]; status: string; borderColor: string }) {
  const cardClasses = useBreakpointValues(responsiveConfig.projectCard)

  return (
    <div className={`bg-dark-600 rounded-3xl border border-dark-300 relative shrink-0 flex flex-col ${cardClasses}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl ${borderColor.replace('border-', 'bg-')}`} />
      
      <h3 className="font-medium text-white mb-1 truncate">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{author}</p>
      
      <div className="flex gap-1.5 flex-wrap mb-2">
        {tags.map((tag) => (
          <span key={tag} className="px-2.5 py-1 bg-dark-500 rounded-md text-xs text-gray-400">
            {tag}
          </span>
        ))}
      </div>

      <div className={`mt-auto -mx-4 -mb-4 px-6 py-2 rounded-b-3xl text-xs font-medium text-white/90 uppercase tracking-wider text-center ${borderColor.replace('border-', 'bg-')}`}>
        {status}
      </div>
    </div>
  )
}

function DeploymentRow({ name, author, status, borderColor }: { name: string; author: string; status: string; borderColor: string }) {
  const rowClasses = useBreakpointValues(responsiveConfig.deploymentRow)

  return (
    <div className={`flex justify-between bg-dark-600 rounded-lg border border-dark-300 ${rowClasses}`}>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-dark-400 flex items-center justify-center shrink-0">
          {icons.logo}
        </div>
        <div className="flex flex-col">
          <h4 className="text-xs md:text-sm font-semibold text-white uppercase truncate">{name}</h4>
          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">{author}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 justify-end">
        <span className={`px-3 py-1 rounded text-xs font-medium uppercase tracking-wider whitespace-nowrap border bg-dark-500/50 text-white ${borderColor}`}>
          {status}
        </span>
        <button className="p-1 bg-transparent border-0 cursor-pointer text-gray-500 shrink-0 hover:text-gray-400 transition-colors">
          {icons.moreOptions}
        </button>
      </div>
    </div>
  )
}

function Overview() {
  const paddingClasses = useBreakpointValues(responsiveConfig.overviewPadding)
  const statsContainerClasses = useBreakpointValues(responsiveConfig.statsContainer)
  const recentsContainerClasses = useBreakpointValues(responsiveConfig.recentsContainer)
  const deploymentHeaderClasses = useBreakpointValues(responsiveConfig.deploymentHeader)

  return (
    <div className="flex flex-col bg-dark-800 min-h-screen">
      <Header />

      <div className={`flex flex-col flex-1 overflow-y-auto ${paddingClasses} max-w-[1600px] mx-auto w-full`}>
        <div className="mb-8 w-full">
          <div className={statsContainerClasses}>
            <StatCard />
            <StatCard />
            <StatCard />
            <StatCard />
          </div>
        </div>

        <div className="mb-16 flex flex-col flex-nowrap gap-4">
          <h2 className="text-base font-medium text-white mb-4">Recents</h2>
          <div className={recentsContainerClasses}>
            <ProjectCard title="Progetto 1" author="Luca Verdi" tags={['ecommerce', 'blog']} status="New Issue" borderColor="border-red-900/70" />
            <ProjectCard title="Progetto 2" author="Luca Verdi" tags={['ecommerce', 'blog']} status="Suspended" borderColor="border-orange-900/70" />
          </div>
        </div>

        <div className="flex flex-col flex-nowrap gap-4">
          <div className={`flex justify-between mb-4 ${deploymentHeaderClasses}`}>
            <h2 className="text-base font-medium text-white">Deployments</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-dark-500 border border-dark-200 rounded-md cursor-pointer hover:border-gray-600 transition-colors">
                {icons.listView}
              </button>
              <button className="p-2 bg-dark-500 border border-dark-200 rounded-md cursor-pointer hover:border-gray-600 transition-colors">
                {icons.gridView}
              </button>
              <button className="px-4 py-2 bg-accent-orange rounded-md text-white text-sm font-medium cursor-pointer flex items-center gap-1 hover:bg-orange-600 transition-colors">
                {icons.plus}
                NEW
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <DeploymentRow name="Progetto 1" author="Marco Rossi" status="Error" borderColor="border-red-500" />
            <DeploymentRow name="Progetto 2" author="Anna Verdi" status="Suspended" borderColor="border-orange-500" />
            <DeploymentRow name="Progetto 3" author="Anna Verdi" status="Up" borderColor="border-green-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview