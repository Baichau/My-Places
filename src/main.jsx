import React from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import App from './App.jsx';

class Boundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="unlock"><div className="modal">
        <h2>Something went wrong</h2>
        <p className="error">{String(this.state.err.message || this.state.err)}</p>
        <button className="btn primary" onClick={() => location.reload()}>Reload</button>
      </div></div>
    );
  }
}
createRoot(document.getElementById('root')).render(<Boundary><App /></Boundary>);
