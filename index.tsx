import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './components/theme-provider';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="uiflash-theme" attribute="class">
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
