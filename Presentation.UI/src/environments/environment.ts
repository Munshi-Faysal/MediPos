export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:7095/api',
  apiVersion: 'v1',
  appName: 'WFE',
  appVersion: '1.0.0',
  enableLogging: true,
  enableMockData: false, // Set to true to use mock users for testing
  recaptcha: {
    siteKey: '6LfGT-8rAAAAAGgMVWj2ht8w7TjU4bVLOUpxbo8G' // Replace with your actual site key from Google reCAPTCHA console
  }
};