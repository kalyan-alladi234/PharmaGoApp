import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, background: '#111827', color: '#fff', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Something went wrong rendering this section.</h3>
          <p style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13 }}>
            {String(this.state.error && this.state.error.message)}
          </p>
          <p style={{ opacity: 0.8 }}>Check the browser console for full details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
