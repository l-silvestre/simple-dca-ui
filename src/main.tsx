import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { EVMWalletProvider } from '@context/evm.tsx'
import { AppThemeProvider } from '@context/app-theme.tsx'
import { CssBaseline } from '@mui/material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <CssBaseline />
      <EVMWalletProvider>
        <App />
      </EVMWalletProvider>
    </AppThemeProvider>
  </StrictMode>,
)
