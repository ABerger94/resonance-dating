import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const enableBase44DevTools = process.env.NODE_ENV !== 'production' && process.env.VITE_ENABLE_DEV_TOOLS === 'true';

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: enableBase44DevTools,
      navigationNotifier: enableBase44DevTools,
      analyticsTracker: false,
      visualEditAgent: enableBase44DevTools
    }),
    react(),
  ]
});
