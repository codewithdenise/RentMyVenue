import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 bg-red-50 text-red-900 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <details className="bg-white p-4 rounded-md mb-4">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-2 text-sm overflow-auto p-2 bg-gray-100 rounded">
              {this.state.error?.toString()}
            </pre>
            {this.state.errorInfo && (
              <pre className="mt-2 text-sm overflow-auto p-2 bg-gray-100 rounded">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
