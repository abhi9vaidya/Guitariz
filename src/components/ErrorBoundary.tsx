import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optional: send to analytics/logging here
    // console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="min-h-[40vh] flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center space-y-4 glass-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold">Something went wrong</h2>
            <p className="text-white/70 text-sm">
              The view failed to render. You can try again.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="px-4 py-2 rounded-lg bg-white text-black hover:opacity-90 transition-premium"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-premium"
              >
                Reload
              </button>
            </div>
            {process.env.NODE_ENV !== "production" && this.state.error && (
              <pre className="text-left text-xs text-white/60 overflow-auto max-h-40 mt-2">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
