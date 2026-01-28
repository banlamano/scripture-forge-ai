import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.scriptureforge.ai',
  appName: 'ScriptureForge AI',

  // We ship a tiny local `index.html` and allow navigation to the live site.
  webDir: 'www',

  server: {
    // Load the live website inside the Capacitor WebView.
    // This keeps the Capacitor JS bridge available (required for native Google Sign-In).
    url: 'https://scripture-forge-ai.vercel.app',
    cleartext: false,
    allowNavigation: [
      'scripture-forge-ai.vercel.app',
      '*.vercel.app',
      'accounts.google.com',
      '*.googleusercontent.com',
      'avatars.githubusercontent.com',
      'checkout.stripe.com',
      'js.stripe.com',
      '*.stripe.com',
    ],
  },

  // Keep the same feel as a native app
  backgroundColor: '#faf8f5',
};

export default config;
