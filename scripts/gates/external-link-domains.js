/**
 * Domain registry for the external-link gate (scripts/gates/check-external-links.js).
 *
 * Every domain that articles may link to must be registered here with a
 * verification strategy. The pre-commit hook refuses commits that link to an
 * unregistered domain, so this file is the single place where a human decides
 * how (or whether) a domain can be machine-verified.
 *
 * Strategies:
 *
 *   status  Plain HTTPS request; the final status code after redirects is
 *           trusted. 404/410 (and a dead DNS name) fail the gate. Use this
 *           for classic server-rendered sites. Optional `okStatuses` lists
 *           extra status codes to accept for hosts with odd but healthy
 *           responses.
 *
 *   render  The page is a client-side app that answers 200 (or a redirect
 *           shell) for valid AND invalid URLs, so the status code proves
 *           nothing — e.g. help.salesforce.com serves the same shell for any
 *           article ID (see docs/content/webdav-article-refresh-2026-07.md).
 *           The gate loads the page in headless Chromium (Playwright), waits
 *           for the client app to settle, and fails when the rendered text
 *           matches one of the domain's `deadMarkers` regexes or the final
 *           URL matches `deadUrlPatterns` (e.g. bounced back to the home
 *           page). Markers are best-effort: tune them here when a site
 *           changes its not-found wording.
 *
 *   skip    Not machine-verifiable; the link is recorded but never fetched.
 *           Give a `reason`: auth-walled portals, bot-blocked hosts that
 *           reject every non-browser client, deliberately fake placeholder
 *           hosts used in examples, or transient by design (event
 *           registrations, Slack invites). Authors verify these by hand.
 *
 * Matching: exact hostname first, then wildcard entries ('*.suffix' matches
 * any subdomain of suffix AND suffix itself). Hostnames are lowercase.
 *
 * Adding a domain: add one entry in the right section below, pick the
 * strategy per the notes above, and re-run the failed commit. The test suite
 * (npm run test:external-links) asserts every domain linked from src/content
 * resolves here, so the baseline can never silently rot.
 *
 * Path overrides: a domain's rule normally applies to every URL on that host
 * (github.com is 'status' because most repos linked from this site are
 * public). When one specific repo or path on an otherwise-fine domain goes
 * auth-walled — e.g. a GitHub repo that was public when an article linked it
 * and later turned private/closed-source — add its URL prefix to
 * PATH_OVERRIDES instead of downgrading the whole domain, which would stop
 * verifying every other link on that host.
 */

const STATUS = Object.freeze({ strategy: 'status' });

const PATH_OVERRIDES = Object.freeze([
  {
    prefix: 'https://github.com/SalesforceCommerceCloud/storefront-reference-architecture',
    strategy: 'skip',
    reason:
      'SFRA repo is now closed-source (GitHub login + Commerce Cloud NDA required); ' +
      'anonymous requests get a login wall or 404, not a real dead-link signal'
  }
]);

/** Not-found wording shared by the Salesforce Lightning-platform SPAs. */
const SALESFORCE_SPA_DEAD_MARKERS = [
  /we can[’']?t find (the|that|this) (article|page)/i,
  /couldn[’']?t find (the|that|this) (article|page)/i,
  /page (you requested |you[’']?re looking for )?(isn[’']?t|is no longer|is not) available/i,
  /page not found/i,
  /took a wrong turn/i,
  /invalid page/i
];

const DOMAIN_RULES = Object.freeze({
  // --- Client-rendered Salesforce properties (async SPAs) -------------------
  // Plain HTTP answers identically for valid and invalid content, so these
  // must be rendered in a browser before the not-found check means anything.
  'help.salesforce.com': {
    strategy: 'render',
    deadMarkers: SALESFORCE_SPA_DEAD_MARKERS,
    // The help SPA bounces unknown articles back to the bare /s/ home page.
    deadUrlPatterns: [/^https:\/\/help\.salesforce\.com\/s\/?(\?.*)?$/]
  },
  'developer.salesforce.com': {
    strategy: 'render',
    deadMarkers: SALESFORCE_SPA_DEAD_MARKERS
  },
  'trailhead.salesforce.com': {
    strategy: 'render',
    deadMarkers: SALESFORCE_SPA_DEAD_MARKERS
  },
  'trailblazer.salesforce.com': {
    strategy: 'render',
    deadMarkers: SALESFORCE_SPA_DEAD_MARKERS
  },
  'ideas.salesforce.com': {
    strategy: 'render',
    deadMarkers: SALESFORCE_SPA_DEAD_MARKERS
  },
  'appexchange.salesforce.com': {
    strategy: 'render',
    deadMarkers: SALESFORCE_SPA_DEAD_MARKERS
  },

  // --- Auth-walled or login-only destinations (cannot verify anonymously) ---
  'account.demandware.com': { strategy: 'skip', reason: 'Account Manager login portal' },
  'admin.us01.dx.commercecloud.salesforce.com': { strategy: 'skip', reason: 'instance login' },
  'controlcenter.commercecloud.salesforce.com': { strategy: 'skip', reason: 'Control Center login' },
  'cs.salesforce.com': { strategy: 'skip', reason: 'Salesforce instance login' },
  'docs.google.com': { strategy: 'skip', reason: 'access depends on document sharing settings' },
  'lucid.app': { strategy: 'skip', reason: 'Lucidchart documents require sign-in' },
  'org62.my.salesforce.com': { strategy: 'skip', reason: 'Salesforce-internal org' },
  'partnerlearningcamp.salesforce.com': { strategy: 'skip', reason: 'partner login required' },
  'partners.salesforce.com': { strategy: 'skip', reason: 'partner community login required' },
  'runtime.commercecloud.com': { strategy: 'skip', reason: 'Managed Runtime login' },

  // --- Bot-blocked hosts (reject every non-interactive client) --------------
  'twitter.com': { strategy: 'skip', reason: 'blocks anonymous/bot requests' },
  'www.amazon.com': { strategy: 'skip', reason: 'bot detection serves CAPTCHAs, not statuses' },
  'www.linkedin.com': { strategy: 'skip', reason: 'auth wall; answers 999/403 to scripts' },
  'x.com': { strategy: 'skip', reason: 'blocks anonymous/bot requests' },

  // --- Transient by design ---------------------------------------------------
  'click.mail.salesforce.com': { strategy: 'skip', reason: 'email click-tracking links expire' },
  'join.slack.com': { strategy: 'skip', reason: 'Slack invite links expire by design' },
  'reg.salesforce.com': { strategy: 'skip', reason: 'event registrations close after the event' },
  'sfcc-unofficial.slack.com': { strategy: 'skip', reason: 'Slack workspace requires membership' },
  'trailblazer.me': { strategy: 'skip', reason: 'profile pages require the Trailblazer app shell' },

  // --- Placeholder / example hosts used in prose ----------------------------
  '*.demandware.net': { strategy: 'skip', reason: 'illustrative instance hostnames' },
  '*.example.com': { strategy: 'skip', reason: 'reserved example domain' },
  'brand.com': { strategy: 'skip', reason: 'placeholder host in examples' },
  'example.com': { strategy: 'skip', reason: 'reserved example domain' },
  'localhost': { strategy: 'skip', reason: 'local development host in examples' },
  'my-brand.com': { strategy: 'skip', reason: 'placeholder host in examples' },
  'mybrand.com': { strategy: 'skip', reason: 'placeholder host in examples' },
  'pwa-kit.mobify-storefront.com': { strategy: 'skip', reason: 'retired PWA Kit demo storefront' },
  'www.your-pwa.com': { strategy: 'skip', reason: 'placeholder host in examples' },

  // --- Everything else: server-rendered, plain status check -----------------
  'aaia-prd.my.commercecloud.salesforce.com': STATUS,
  'admin.salesforce.com': STATUS,
  'aegis.rhino-inquisitor.com': STATUS,
  'allaboutdnt.com': STATUS,
  'architect.salesforce.com': STATUS,
  'auth0.com': STATUS,
  'aws.amazon.com': STATUS,
  'azure.microsoft.com': STATUS,
  'b2c.learncommercecloud.com': STATUS,
  'beeit.io': STATUS,
  'bitbucket.org': STATUS,
  'blog.cloudflare.com': STATUS,
  'blog.logrocket.com': STATUS,
  'blog.risingstack.com': STATUS,
  'caniuse.com': STATUS,
  'chat.openai.com': STATUS,
  'chrome.google.com': STATUS,
  'community.cloudflare.com': STATUS,
  'configurator.cquotient.com': STATUS,
  'czechdreamin.com': STATUS,
  'datatracker.ietf.org': STATUS,
  'date-fns.org': STATUS,
  'dev.to': STATUS,
  'developer.apple.com': STATUS,
  'developer.chrome.com': STATUS,
  'developer.commercecloud.com': STATUS,
  'developer.mozilla.org': STATUS,
  'developers.cloudflare.com': STATUS,
  'developers.google.com': STATUS,
  'docs.adyen.com': STATUS,
  'docs.commercetools.com': STATUS,
  'docs.netapp.com': STATUS,
  'dora.dev': STATUS,
  'dreamole.es': STATUS,
  'dwithease.com': STATUS,
  'einstein-b2c-exp-salesforce.herokuapp.com': STATUS,
  'elementor.com': STATUS,
  'emojipedia.org': STATUS,
  'en.wikipedia.org': STATUS,
  'entreprendre.service-public.fr': STATUS,
  'expressjs.com': STATUS,
  'focusonforce.com': STATUS,
  'forbusiness.snapchat.com': STATUS,
  'force.com': STATUS,
  'forward.eu': STATUS,
  'frenchtouchdreamin.com': STATUS,
  'gist.github.com': STATUS,
  'github.com': STATUS,
  'gohugo.io': STATUS,
  'help.sap.com': STATUS,
  'help.shopify.com': STATUS,
  'hstspreload.org': STATUS,
  'hydrogen.shopify.dev': STATUS,
  'joolfe.github.io': STATUS,
  'jwt.io': STATUS,
  'kapeli.com': STATUS,
  'kount.com': STATUS,
  'letsencrypt.org': STATUS,
  'lifewithgoldiepodcast.buzzsprout.com': STATUS,
  'lirantal.medium.com': STATUS,
  'listings.pcisecuritystandards.org': STATUS,
  'marketplace.magnolia-cms.com': STATUS,
  'marketplace.visualstudio.com': STATUS,
  'medium.com': STATUS,
  'meighanrockssf.com': STATUS,
  'mission.org': STATUS,
  'mozilla.github.io': STATUS,
  'my-store-5a6a56.creator-spring.com': STATUS,
  'newsroom.fedex.com': STATUS,
  'nl.wikipedia.org': STATUS,
  'northafricadreamin.com': STATUS,
  'ocapi-settings-with-ease.herokuapp.com': STATUS,
  'open.spotify.com': STATUS,
  'openai.com': STATUS,
  'openid.net': STATUS,
  'osapishchuk.medium.com': STATUS,
  'parall.ax': STATUS,
  'partners-salesforce.relayto.com': STATUS,
  'peterschmalfeldt.com': STATUS,
  'platform.openai.com': STATUS,
  'play.google.com': STATUS,
  'podcasts.apple.com': STATUS,
  'podcasts.google.com': STATUS,
  'rawgit.com': STATUS,
  'react.dev': STATUS,
  'reactjs.org': STATUS,
  'redvanworkshop.com': STATUS,
  'resources.docs.salesforce.com': STATUS,
  's0t2r.csb.app': STATUS,
  'salesforce.stackexchange.com': STATUS,
  'salesforce.vidyard.com': STATUS,
  'salesforcecommercecloud.github.io': STATUS,
  'sfcc-mcp-dev.rhino-inquisitor.com': STATUS,
  'sfcclearning.com': STATUS,
  'share.vidyard.com': STATUS,
  'shirtforce.org': STATUS,
  'simonsinek.com': STATUS,
  'snyk.io': STATUS,
  'spec.openapis.org': STATUS,
  'status.salesforce.com': STATUS,
  'storybook.js.org': STATUS,
  'stripe.com': STATUS,
  'supermums.org': STATUS,
  'support.1password.com': STATUS,
  'support.cloudflare.com': STATUS,
  'syntax.fm': STATUS,
  'tanstack.com': STATUS,
  'techcrunch.com': STATUS,
  'teespring.com': STATUS,
  'trailblazercommunitygroups.com': STATUS,
  'trailheadacademy.salesforce.com': STATUS,
  'uk.news.yahoo.com': STATUS,
  'unofficialsfcc.com': STATUS,
  'unofficialsfccpodcast.com': STATUS,
  'v5.reactrouter.com': STATUS,
  'viewer.diagrams.net': STATUS,
  'workik.com': STATUS,
  'www.adyen.com': STATUS,
  'www.apexhours.com': STATUS,
  'www.atlassian.com': STATUS,
  'www.braintreepayments.com': STATUS,
  'www.businesswire.com': STATUS,
  'www.cactusforce.com': STATUS,
  'www.ccv.eu': STATUS,
  'www.cisa.gov': STATUS,
  'www.cloudflare.com': STATUS,
  'www.commerceforz.com': STATUS,
  'www.dailydot.com': STATUS,
  'www.devlinpeck.com': STATUS,
  'www.digitalcommerce360.com': STATUS,
  'www.digitscommerce.com': STATUS,
  'www.edwindanromero.com': STATUS,
  'www.forbes.com': STATUS,
  'www.force.com': STATUS,
  'www.forgerock.com': STATUS,
  'www.forward.eu': STATUS,
  'www.freeformatter.com': STATUS,
  'www.grammarly.com': STATUS,
  'www.ic3.gov': STATUS,
  'www.iso.org': STATUS,
  'www.klarna.com': STATUS,
  'www.lightningdesignsystem.com': STATUS,
  'www.londonscalling.net': STATUS,
  'www.mollie.com': STATUS,
  'www.mulesoft.com': STATUS,
  'www.newstore.com': STATUS,
  'www.npmjs.com': STATUS,
  'www.nytimes.com': STATUS,
  'www.oracle.com': STATUS,
  'www.postman.com': STATUS,
  'www.qodo.ai': STATUS,
  'www.qualified.com': STATUS,
  'www.radial.com': STATUS,
  'www.rhino-inquisitor.com': STATUS,
  'www.riskiq.com': STATUS,
  'www.salesforce.com': STATUS,
  'www.salesforceben.com': STATUS,
  'www.sap.com': STATUS,
  'www.sfcclearning.com': STATUS,
  'www.signifyd.com': STATUS,
  'www.sitepoint.com': STATUS,
  'www.six-payment-services.com': STATUS,
  'www.theverge.com': STATUS,
  'www.w3.org': STATUS,
  'www.webassessor.com': STATUS,
  'www.wolfpack-agency.com': STATUS,
  'www.yeurdreamin.eu': STATUS,
  'www.youtube.com': STATUS,
  'www.yubico.com': STATUS,
  'www.zdnet.com': STATUS,
  'youtu.be': STATUS,
  'yudhajitadhikary.medium.com': STATUS
});

const VALID_STRATEGIES = Object.freeze(['status', 'render', 'skip']);

/**
 * Resolve the rule for a link: a PATH_OVERRIDES prefix match on `url` first
 * (when given), then the hostname's exact entry, then '*.suffix' wildcards
 * (matching subdomains and the bare suffix). Returns null when the domain is
 * not registered — the caller turns that into the blocking "new domain"
 * error.
 */
function resolveDomainRule(hostname, rules = DOMAIN_RULES, url = null) {
  if (url) {
    for (const override of PATH_OVERRIDES) {
      if (url.startsWith(override.prefix)) {
        return { domain: override.prefix, strategy: override.strategy, reason: override.reason };
      }
    }
  }
  const host = String(hostname).toLowerCase();
  if (Object.hasOwn(rules, host)) {
    return { domain: host, ...rules[host] };
  }
  for (const [pattern, rule] of Object.entries(rules)) {
    if (!pattern.startsWith('*.')) continue;
    const suffix = pattern.slice(2);
    if (host === suffix || host.endsWith(`.${suffix}`)) {
      return { domain: pattern, ...rule };
    }
  }
  return null;
}

export {
  DOMAIN_RULES,
  VALID_STRATEGIES,
  SALESFORCE_SPA_DEAD_MARKERS,
  PATH_OVERRIDES,
  resolveDomainRule
};
