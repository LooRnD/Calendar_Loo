import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Hide loading message once script executes
const loadingEl = document.getElementById('loading');
if (loadingEl) loadingEl.style.display = 'none';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', fontFamily: 'sans-serif', color: '#FF4757', background: '#FFF0F0', minHeight: '100vh' }}>
          <h2>Oops! The application encountered an error during initialization.</h2>
          <p>Detailed error code:</p>
          <pre style={{ background: 'white', padding: '16px', borderRadius: '8px', overflowX: 'auto', border: '1px solid #FFCDD2', color: '#333' }}>
            {this.state.error && this.state.error.toString()}
            {'\n'}
            {this.state.error && this.state.error.stack}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: 20, padding: '10px 20px', background: '#FF4757', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Clear Data & Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
