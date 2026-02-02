import { useState, useEffect } from 'react'

interface BreakpointValues {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  breakpoint: 'mobile' | 'tablet' | 'desktop'
}

export function useResponsive(): BreakpointValues {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const getBreakpoint = (): 'mobile' | 'tablet' | 'desktop' => {
      const width = window.innerWidth
      if (width <= 640) return 'mobile'
      if (width <= 1024) return 'tablet'
      return 'desktop'
    }

    function handleResize(): void {
      setBreakpoint(getBreakpoint())
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return (): void => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    breakpoint,
  }
}

export function useBreakpointValues<T>(
  values: Record<'mobile' | 'tablet' | 'desktop', T>
): T {
  const { breakpoint } = useResponsive()
  return values[breakpoint]
}
