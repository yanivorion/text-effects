import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SvgFilters, BodyOutlineOutFilters, BodyGlassFilters } from './effects/index.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SvgFilters />
    <BodyOutlineOutFilters />
    <BodyGlassFilters />
    <App />
  </React.StrictMode>
);
