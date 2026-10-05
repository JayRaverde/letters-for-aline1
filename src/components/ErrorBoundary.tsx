import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Heart, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Sanctuary Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('meridian_sanctuary_v1_stars');
    } catch {}
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d050a] text-[#fdf2f4] flex flex-col items-center justify-center p-6 text-center font-serif">
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#e11d48]/20 border border-[#e11d48] animate-pulse" />
            <Heart className="w-10 h-10 fill-[#e11d48] text-[#fda4af]" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#fda4af] mb-2">
            LETTERS ACROSS THE MERIDIAN
          </span>
          <h1 className="text-3xl font-bold text-white mb-3">
            For My Sweet Aline
          </h1>
          <p className="text-sm text-[#d1a3ac] max-w-md mx-auto mb-6 italic leading-relaxed">
            "No distance can break this sanctuary. Taking a quiet breath and welcoming you back in..."
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white text-xs font-mono font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Open Sanctuary</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
