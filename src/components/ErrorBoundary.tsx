import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Dashboard Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center
                        justify-center p-6 text-center">
          <div className="space-y-4 max-w-sm">
            <div className="text-4xl">🏥</div>
            <h2 className="text-xl font-bold text-white">
              Something went wrong
            </h2>
            <p className="text-slate-400 text-sm">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-sky-500 text-white
                         rounded-xl font-medium text-sm
                         hover:bg-sky-600 transition-colors"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
