import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.scriptureforge.ai',
  appName: 'ScriptureForge AI',

  // We ship a tiny local `index.html` and allow navigation to the live site.
  webDir: 'www',

  server: {
    // Live website to wrap
    url: 'https://scripture-forge-ai.vercel.app',
    // Required so the app can load the remote URL from the app bundle context
    cleartext: false,

    // Allow navigation to your domain + common external services used by the site.
    // (This is important when `server.url` is used.)
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
