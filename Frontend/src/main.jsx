import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/bottom-nav.css';
import './styles/layout.css';
import './styles/desktop-pages.css';

import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
