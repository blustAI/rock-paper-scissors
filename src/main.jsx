import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BlustaiCoreProvider } from 'blustai-react-core';
import { HelmetProvider } from 'react-helmet-async';
import 'regenerator-runtime/runtime';
import './index.css'

const helmetContext = {};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider context={helmetContext}>
      <BlustaiCoreProvider config={{ API_URL: import.meta.env.VITE_API_URL, WS_URL: import.meta.env.VITE_WS_URL, LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL}}>
        <App />
      </BlustaiCoreProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
