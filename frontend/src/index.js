import 'intersection-observer';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './i18n'; // Import i18n configuration

// Suppress ResizeObserver loop error
const resizeObserverLoopErr = () => {
  let observer = new ResizeObserver(() => {});
  observer.observe(document.body);
  observer.disconnect();
};

window.addEventListener('error', (event) => {
  if (event.message === 'ResizeObserver loop limit exceeded' || event.message === 'ResizeObserver loop completed with undelivered notifications.') {
    event.stopImmediatePropagation();
  }
});

resizeObserverLoopErr();

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
