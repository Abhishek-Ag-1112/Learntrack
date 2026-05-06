import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('Uncaught error:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{color: '#ff6b6b', padding: '40px', backgroundColor: '#0a0a0a', height: '100vh', fontFamily: 'monospace'}}>
          <h2 style={{fontSize: '24px', marginBottom: '20px'}}>Fatal React Error</h2>
          <pre style={{whiteSpace: 'pre-wrap', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px'}}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
