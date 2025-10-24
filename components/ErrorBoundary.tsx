'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 * 
 * Usage:
 * <ErrorBoundary fallback={<CustomError />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can log to external service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1b1c1f] border-2 border-red-500/50 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-300 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#f7931a] hover:bg-[#ffd166] text-[#0b0c10] px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Go Home
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-black/50 p-3 rounded overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

