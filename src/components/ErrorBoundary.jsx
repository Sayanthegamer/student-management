import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';


/**
 * ErrorBoundary Component
 * 
 * @returns {JSX.Element} The rendered component.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-6">
                    <div className="bg-[var(--bg-card)] rounded-[16px] shadow-xl p-8 max-w-md w-full text-center border border-rose-500/20">
                        <div className="bg-rose-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} className="text-rose-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Something went wrong</h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            The application encountered an unexpected error. We apologize for the inconvenience.
                        </p>

                        <div className="bg-[var(--bg-main)] border border-rose-500/10 rounded-[12px] p-4 mb-6 text-left overflow-hidden">
                            <p className="text-xs text-rose-500/80 font-mono break-all">
                                {this.state.error && this.state.error.toString()}
                            </p>
                        </div>

                        <button
                            onClick={this.handleReload}
                            className="btn bg-[var(--accent-primary)] text-white w-full hover:bg-[var(--accent-hover)] border border-[var(--accent-primary)] transition-colors shadow-sm"
                        >
                            <RefreshCw size={18} />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
