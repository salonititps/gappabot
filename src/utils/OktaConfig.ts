export const oktaConfig = {
  // issuer: 'https://trial-9265416.okta.com/oauth2/default',
  clientId: '0oay7y2kp1mSaS273697',

  redirectUri: 'com.oktarn:/callback',
  endSessionRedirectUri: 'com.oktarn:/logout',

  discoveryUri: 'https://trial-9265416.okta.com/oauth2/default',

  scopes: ['openid', 'profile', 'offline_access'],
  requireHardwareBackedKeyStore: false,

  // Android-specific settings for browser sign-in
  // browserMatchAll: true,
};
