// src/components/common/ErrorBoundary.tsx
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-gray-950/50 backdrop-blur-md rounded-2xl border border-red-500/20">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Something went wrong</h2>
          <p className="text-gray-400 max-w-md mb-6">
            {this.state.error?.message || "An unexpected rendering error occurred inside this component."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-violet-600/30"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
