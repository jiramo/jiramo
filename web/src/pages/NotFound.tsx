import { useBreakpointValues } from '../hooks/useResponsive'

function NotFound() {
  const containerClasses = useBreakpointValues({
    mobile: 'p-4',
    tablet: 'p-5',
    desktop: 'p-8',
  })

  const titleClasses = useBreakpointValues({
    mobile: 'text-5xl',
    tablet: 'text-6xl',
    desktop: 'text-8xl',
  })

  const subtitleClasses = useBreakpointValues({
    mobile: 'text-xl',
    tablet: 'text-2xl',
    desktop: 'text-2xl',
  })

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-dark-800 text-center ${containerClasses}`}>
      <h1 className={`font-bold text-dark-300 mb-4 ${titleClasses}`}>404</h1>
      <h2 className={`font-semibold text-white mb-2 ${subtitleClasses}`}>Page Not Found</h2>
      <p className="text-base text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
      <a
        href="/"
        className="px-6 py-3 bg-accent-orange rounded-lg text-white text-sm font-medium no-underline hover:bg-orange-600 transition-colors"
      >
        Go Back Home
      </a>
    </div>
  )
}

export default NotFound
