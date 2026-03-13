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

const config = {
  defaults: {
    standard: 'WCAG2AA',
    runners: ['htmlcs'],
    threshold: 0,
    timeout: 30000,
    wait: 500
  },
  urls: representativeRoutes
};

export { approvedNonCriticalAaExceptions, manualKeyboardRoutes, representativeRoutes };

export default config;