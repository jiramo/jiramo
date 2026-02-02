import { useBreakpointValues } from '../hooks/useResponsive'

interface PagePlaceholderProps {
  title: string
}

function PagePlaceholder({ title }: PagePlaceholderProps) {
  const paddingClasses = useBreakpointValues({
    mobile: 'p-4',
    tablet: 'p-5',
    desktop: 'p-8',
  })

  const titleClasses = useBreakpointValues({
    mobile: 'text-lg',
    tablet: 'text-xl',
    desktop: 'text-2xl',
  })

  return (
    <div className={`bg-dark-800 min-h-screen ${paddingClasses}`}>
      <h2 className={`font-semibold text-white mb-6 ${titleClasses}`}>{title}</h2>
      <p className="text-gray-500 text-base">{title} content coming soon...</p>
    </div>
  )
}

export default PagePlaceholder
