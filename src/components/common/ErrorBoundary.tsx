import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import './ErrorBoundary.css';

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
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // Log to console in development
        console.error('Error caught by boundary:', error, errorInfo);

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // reportError(error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary">
                    <div className="error-boundary__card">
                        <div className="error-boundary__icon">
                            <AlertTriangle size={48} strokeWidth={1.5} />
                        </div>
                        <h1 className="error-boundary__title">Something went wrong</h1>
                        <p className="error-boundary__message">
                            We encountered an unexpected error. Our team has been notified and is working on a fix.
                        </p>

                        {this.state.error && (
                            <details className="error-boundary__details">
                                <summary>Error Details</summary>
                                <pre>{this.state.error.toString()}</pre>
                                <pre>{this.state.errorInfo?.componentStack}</pre>
                            </details>
                        )}

                        <div className="error-boundary__actions">
                            <button onClick={this.handleReload} className="btn btn-primary">
                                <RefreshCw size={16} />
                                Reload Page
                            </button>
                            <button onClick={this.handleGoHome} className="btn">
                                <Home size={16} />
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
