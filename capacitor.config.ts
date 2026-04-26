import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b4f4ea8a45174c5687e58a53e2bfcb4c',
  appName: 'AdroitVocab',
  webDir: 'dist',
  server: {
    url: 'https://b4f4ea8a-4517-4c56-87e5-8a53e2bfcb4c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1e3a8a',
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#1e3a8a',
    },
  },
};

export default config;
