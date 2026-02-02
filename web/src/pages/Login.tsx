import { useBreakpointValues } from '../hooks/useResponsive'

function Login() {
  const containerClasses = useBreakpointValues({
    mobile: 'p-4',
    tablet: 'p-5',
    desktop: 'p-8',
  })

  const cardClasses = useBreakpointValues({
    mobile: 'w-full px-6 py-8',
    tablet: 'w-[400px] px-8 py-8',
    desktop: 'w-[400px] px-8 py-8',
  })

  const titleClasses = useBreakpointValues({
    mobile: 'text-xl',
    tablet: 'text-2xl',
    desktop: 'text-2xl',
  })

  return (
    <div className={`min-h-screen flex items-center justify-center bg-dark-800 ${containerClasses}`}>
      <div className={`bg-dark-600 rounded-2xl border border-dark-300 ${cardClasses}`}>
        <div className="text-center mb-8">
          <h1 className={`font-semibold text-white mb-2 ${titleClasses}`}>Jiramo</h1>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-dark-500 border border-dark-200 rounded-lg text-sm text-white focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange focus:ring-offset-2 focus:ring-offset-dark-600 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-dark-500 border border-dark-200 rounded-lg text-sm text-white focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange focus:ring-offset-2 focus:ring-offset-dark-600 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-accent-orange rounded-lg text-white text-sm font-medium cursor-pointer hover:bg-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2 focus:ring-offset-dark-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <a href="#" className="text-accent-orange font-medium hover:underline transition-all duration-200">Sign up</a>
        </p>
      </div>
    </div>
  )
}

export default Login
