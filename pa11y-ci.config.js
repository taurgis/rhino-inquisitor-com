const representativeRoutes = [
  '/',
  '/reflecting-on-2-years-of-blogging/',
  '/category/platform/',
  '/privacy-policy/'
];

const manualKeyboardRoutes = [
  '/',
  '/reflecting-on-2-years-of-blogging/'
];

const approvedNonCriticalAaExceptions = [];

const chromeLaunchConfig = process.platform === 'linux' && process.env.CI === 'true'
  ? {
      args: ['--no-sandbox']
    }
  : undefined;

const config = {
  defaults: {
    standard: 'WCAG2AA',
    runners: ['htmlcs'],
    threshold: 0,
    timeout: 30000,
    wait: 500,
    ...(chromeLaunchConfig ? { chromeLaunchConfig } : {})
  },
  urls: representativeRoutes
};

export { approvedNonCriticalAaExceptions, manualKeyboardRoutes, representativeRoutes };

export default config;