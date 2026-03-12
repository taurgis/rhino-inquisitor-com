---
title: PWA Kit Developer's Guide to Storefront Speed
description: >-
  Let's be honest: a slow e-commerce site is a silent killer of sales. In the
  world of B2C Commerce, every millisecond is money.
date: '2025-06-23T17:00:05.000Z'
lastmod: '2025-06-24T18:21:36.000Z'
url: /lag-to-riches-a-pwa-kit-developers-guide/
draft: false
heroImage: /media/2025/developer-manipulating-performance-scaled-3869da0b9c.jpeg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - sfcc
  - technical
author: Thomas Theunen
---
Truth be told: a slow e-commerce site is a silent killer of sales. In the world of B2C Commerce, every millisecond is money. As a PWA Kit developer, you're on the front lines of a battle where the prize is customer loyalty and the cost of defeat is a lost shopping cart. Today's shoppers have zero patience for lag. They expect buttery-smooth, app-like experiences, and they'll bounce if you don't deliver.

The numbers don't lie. A one-second delay can reduce conversions by as much as 7%. But flip that around: a tiny 0.1-second improvement can boost conversion rates by a whopping 8% and keep shoppers from abandoning their carts. When you consider that more than half of mobile users will leave a site that takes over three seconds to load, the mission is crystal clear: speed is everything.

So, how do we win this battle? We need the proper intel and the right weapons. That's where Google's Core Web Vitals (CWV) and the Chrome User Experience Report (CrUX) come in. These aren't just abstract numbers; they're a direct line into how _real people_ experience your storefront.

This post is your new playbook. We're going to break down why every millisecond matters and provide you with an actionable roadmap for taking the Composable Storefront to the next level.

## Step 1: Know Your Numbers - Getting Real with CrUX and Core Web Vitals

Before you can optimise anything, you need to understand what you're measuring. Let's demystify the data that both your users and Google care about, starting with the difference between what happens in a controlled lab and what happens in the messy real world.

### Meet CrUX: Your Real-World Report Card

The Chrome User Experience Report (CrUX) is a massive public dataset from Google, packed with real-world metrics from actual Chrome users. It's the official source for Google's Web Vitals program and the ultimate ground truth for how your site performs for your visitors.

This data comes from Chrome users who have opted in to syncing their browsing history and have usage statistic reporting enabled, without a Sync passphrase. For your site to appear in the public dataset, it must be discoverable and have sufficient traffic to ensure that all data is anonymous and statistically significant.

Here are two things you absolutely must know about CrUX:

1. **It's a 28-Day Rolling Average:** CrUX data isn't live. It's a trailing 28-day snapshot of user experiences. This means when you push a brilliant performance fix, you won't see its full impact on your CrUX scores for up to a month. It's a marathon, not a sprint.
1. **It's All About the 75th Percentile:** To evaluate your site's performance, CrUX focuses on the 75th percentile. This means that to achieve a "Good" score for a metric, at least 75% of your (hard navigation) pageviews must have an experience that meets the "Good" mark. This focuses on the majority experience while ignoring the wild outliers on terrible connections.

You can also slice and dice CrUX data, such as device type, providing a powerful lens into your specific audience's experience.

Hard vs Soft Navigation It is crucial for you to understand the distinction between a hard and a soft navigation, particularly for Single-Page Applications (SPAs), as this difference significantly impacts how performance is measured by the Chrome User Experience Report (CrUX).

A hard navigation refers to the traditional, full loading of a webpage, which occurs when a user first lands on a site. In contrast, a soft navigation happens within an SPA when new content is loaded dynamically without a full page refresh, a process managed by JavaScript.

**The critical point to recognize is that CrUX data, which is vital for assessing real-user web performance and Core Web Vitals, is primarily based on hard navigations. Consequently, for an SPA,** **only the initial page load is typically recorded by CrUX, while all subsequent, faster soft navigations are not taken into account, potentially leading to a skewed and incomplete understanding of the application's overall user experience**.

Here is an [official article on the matter](https://developer.chrome.com/docs/web-platform/soft-navigations-experiment)!

### Lab Coats vs. The Real World: Why Field Data is King

This is one of the most common points of confusion, so let's clarify it.

**Field Data (The "What")** is what we've been talking about—data from real users on their own devices and networks. It's also known as Real User Monitoring (RUM), and CrUX is the largest public source of it. It captures the beautiful chaos of the real world: slow phones, spotty Wi-Fi, and everything in between. It tells you _what_ is happening.

**Lab Data (The "Why")** is what you get from a controlled test, like running Google Lighthouse. It simulates a specific device and network to provide you with a performance report. Lab data is your diagnostic tool. It helps you understand why you're seeing the numbers in your field data.

Here's the million-dollar takeaway: **Google uses field data from CrUX for its page experience ranking signal, NOT your lab-based Lighthouse score.**

Google wants to reward sites that are genuinely fast for real people, not just in a perfect lab setting. Your goal isn't to achieve a 100% score on Lighthouse; your goal is to ensure at least 75% of your real users pass the Core Web Vitals thresholds.

Lighthouse is the tool that helps you get there.

### The Big Three: LCP, INP, and CLS Explained

[![Three-panel illustration of Slow LCP, High INP, and High CLS problems.](/media/2025/core-web-vitals-visualised-e1750704059141-9cbbc8c421.jpg)](/media/2025/core-web-vitals-visualised-e1750704059141-9cbbc8c421.jpg)

A visual guide to Core Web Vital problems: How poor LCP, INP, and CLS create a frustrating user experience.

Core Web Vitals are the metrics that matter most. They measure three key aspects of user experience: loading, interactivity, and visual stability.

Largest Contentful Paint (LCP): Are We There Yet?

- **What it is:** LCP measures how long it takes for the largest image or block of text to appear on the screen. It's an excellent proxy for when a user _Feels_ like the page's main content has loaded.
- **The goal is to achieve a** "Good" result, which is defined as 2.5 seconds or less. "Poor" is over four seconds.
- **Why it Matters for E-commerce:** A slow LCP means your customer is staring at a loading screen instead of your product. This initial frustration is a one-way ticket to a high bounce rate.

Interaction to Next Paint (INP): Did That Click Do Anything?

- **What it is:** INP measures how responsive your page is to user input. It tracks the delay for _all_ clicks, taps, and key presses during a visit and reports a single value representing the system's overall responsiveness. A high INP is what users refer to as "janky" or "unresponsive." It replaced First Input Delay (FID) in March 2024 because it's a much better measure of the entire user journey.
- **The Goal:** "Good" is 200 milliseconds or less. "Poor" is over 500ms.
- **Why It Matters for E-commerce:** High INP Kills Conversions. When a user clicks "Add to Cart" and nothing happens instantly, they lose trust and get frustrated. This leads to "rage clicks" and, ultimately, abandoned carts.

Cumulative Layout Shift (CLS): Stop Moving!

- **What it is:** CLS measures how much your page's content unexpectedly jumps around as it loads. It calculates a score based on how much things move and how far they move without the user doing anything
- **The Goal:** "Good" is a score of 0.1 or less. "Poor" is over 0.25.
- **Why it Matters for E-commerce:** Have you ever tried to click a button, only to have an ad load and push it down, making you click the wrong thing? That's high CLS. It's infuriating for users and makes your site feel broken and untrustworthy.

## Step 2: Understand Your Architecture - The PWA Kit's Double-Edged Sword

The Salesforce PWA Kit is engineered for speed, but its modern architecture creates two distinct performance battlegrounds. To win, you need to understand how to fight on both fronts.

### The First Impression: Server-Side Rendering (SSR) to the Rescue

[![A vibrant, two-panel cartoon comparing web rendering methods. The top panel, 'Client-Side Rendering,' shows a stressed user buried in parts from a 'JavaScript Bundle' box. The bottom panel, 'Server-Side Rendering,' shows a happy user cheering as a heroic robot serves them a complete, glowing webpage on a platter.](/media/2025/server-side-rendering-client-side-e72f226d1b.jpg)](/media/2025/server-side-rendering-client-side-e72f226d1b.jpg)

From frustrating assembly to instant delight: The power of Server-Side Rendering.

When a user first lands on your site, the PWA Kit uses Server-Side Rendering (SSR) to make a great first impression. Here's the play-by-play:

1. A user requests a page.
1. The request hits an Express.js app server running in the Salesforce Managed Runtime (MRT).
1. On the server, your React components are rendered into a complete HTML document, with all necessary data fetched directly from the Commerce APIs.
1. This fully baked HTML page is sent directly to the user's browser.

The huge win here is for your **Largest Contentful Paint (LCP)**. The browser gets a meaningful page instantly, instead of a blank screen and a giant JavaScript file it has to figure out.

The **Managed Runtime** then takes this to the next level. It has a built-in Content Delivery Network (CDN) that can cache these server-rendered pages.
If another user requests the same page, the CDN can serve the cached version instantly, completely bypassing the server. A cached SSR response is the fastest you can get, leading to stellar LCP and Time to First Byte (TTFB) scores.

### The Main Event: Hydration and Client-Side Interactivity

Once that initial HTML page loads, the magic of **hydration** happens. The client-side JavaScript bundle downloads, runs, and brings the static HTML to life by attaching all the event handlers and state.

From this moment on, your storefront is a Single-Page Application (SPA). All navigation and UI changes are handled by **Client-Side Rendering (CSR)**. When a user clicks a link, JavaScript takes over, fetches new data, and renders only the parts of the page that need to change, all without a full page reload.

This is the "double-edged sword." CSR provides that fluid, app-like feel, but it's also where you'll find the bottlenecks that hurt your **Interaction to Next Paint (INP)**.

This creates a clear divide: LCP optimisation is a server-side game of efficient rendering and aggressive caching. INP optimisation is a client-side battle against bloated, inefficient JavaScript.

You can have a fantastic LCP score but still have a terrible user experience due to high INP from clunky client-side code. PWA Kit projects are powerful React apps, and they can get JavaScript-heavy if you're not careful. And the built-in libraries used, such as Chakra, are not making it easy for you to win this battle.

You need to wear two hats: a backend/DevOps hat for the initial load, and a frontend performance specialist hat for everything after.

### The Usual Suspects: Common PWA Kit Performance Bottlenecks

Every PWA Kit developer will eventually face these common performance villains. Here's your wanted list:

- **Bloated JavaScript Bundles:** The Retail React App template is excellent, but if you don't manage it properly, your JS bundle can become huge. Every new feature adds weight, slowing down hydration and hurting INP.
- **Clumsy Data Fetching:** Whether you're using the old getProps or the new withReactQuery, you can still make mistakes. Fetching data sequentially instead of in parallel, grabbing significantly more data than needed, or re-fetching data on the client that the server has already provided are all common ways to slow down TTFB and LCP.
- **Unruly Third-Party Scripts:** These are public enemy #1. Scripts for analytics, ads, A/B testing, and support chats can be performance nightmares. They block the main thread, tank your INP, and can even mess with your service worker caching.
- **Poorly Built Custom Components:** A single custom React component that isn't optimised for performance can significantly impact your INP. This typically occurs through expensive calculations on every render or by triggering a chain reaction of unnecessary re-renders in its children.
- **Messed-Up Caching:** The MRT's CDN is powerful, but it's not magic. If you don't set your Cache-Control headers correctly, fail to filter out unnecessary query parameters, or misconfigure your [API](https://developer.salesforce.com/docs/commerce/commerce-api/guide/server-side-web-tier-caching.html) proxies, you'll experience a poor cache-hit ratio, and all the benefits of Server-Side Rendering (SSR) will be lost.

[![A colorful cartoon of a chaotic factory illustrating four web performance bottlenecks. The bottlenecks shown are: a giant truck labeled 'Large Bundle Size' blocking the entrance, many small pipes labeled 'Network Waterfalls' slowly filling a tank, a complex machine for a simple task labeled 'Re-render Storms', and workers slipping on puddles labeled 'Memory Leaks'.](/media/2025/spa-performance-bottlenecks-6d6a3a6a62.jpeg)](/media/2025/spa-performance-bottlenecks-6d6a3a6a62.jpeg)

Inside a struggling SPA: A visual guide to common performance bottlenecks.

## Step 3: The Performance Playbook - Your Guide to a Faster Storefront

Now that you know the what and the why, let's get to the how. Here are the specific, actionable plays you can run to build a high-performance storefront.

### Master Your Data Fetching

How you fetch data is critical for a fast LCP and a snappy experience.

- **Use withReactQuery for New Projects:** If you're on PWA Kit v3+, withReactQuery is your best friend. It utilises the popular React Query library to make fetching data on both the server and client a breeze. It smartly avoids re-fetching data on the client that the server has already retrieved, which means cleaner code and improved performance.
- **Optimise getProps for Legacy Projects:** Stuck on an older project? No problem. Optimise your getProps calls:

- **Be a Minimalist:** Return only the exact data your component needs for its initial render. Don't send the whole API response object. This keeps your HTML payload small.
  - **Go Parallel:** If a page needs data from multiple APIs, use Promise.all to fire off those requests at the same time. This is way faster than waiting for them one by one.
  - **Handle Errors with Finesse:** For critical errors (such as a product not found), throw an HTTPError to display a proper error page. For non-critical stuff, pass an error flag in props so the component can handle it without crashing.
- **Fetch Non-Essential Data on the Client:** Anything that's not needed for the initial, above-the-fold view (such as reviews or related products) should be fetched on the client side within an useEffect hook. This enables your initial page to load faster, improving TTFB and LCP.

### Whip Your JavaScript and Components into Shape

Your client-side React code is the most significant factor for INP. Time to optimise.

- **Split Your Code:** The PWA Kit is already set up for code splitting with Webpack, so use it! Load your page-level components dynamically with the [loadable](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/970a3343ba05b321f66ae62192172ea3a42380a7/packages/template-retail-react-app/app/routes.jsx#L16) utility. This means the code for the product detail page is only downloaded when a user visits it, thereby shrinking your initial bundle size.
- **Lazy Load Below-the-Fold:** For heavy components that are "below the fold" or in modals, use lazy loading.
- **Stop Wasting Renders:** Unnecessary re-renders are a top cause of poor INP. Use React's memoisation hooks like a pro:

- **React.memo:** Wrap components in React.memo to stop them from re-rendering if their props haven't changed. Perfect for simple, presentational components.
  - **useCallback:** When you pass functions as props to memoised children, wrap them in useCallback. This maintains the function's reference stability, preventing the child from re-rendering unnecessarily.
  - **useMemo:** Use useMemo for expensive calculations. This caches the result so it's not recalculated on every single render.
- **Be Smart with State:** The Context API is great, but be careful. Any update to a context re-renders _all_ components that use it. For complex states, break your contexts into smaller, logical pieces (like a UserContext and a CartContext) to keep re-renders contained.

### Become a Caching Ninja with Managed Runtime

Getting your CDN cache hit ratio as high as possible is the single most effective way to boost LCP for most of your users.

- **Set Granular Cache-Control Headers:**

- **Per-Page:** Inside a page's getProps function, you can set a custom cache time. A static "About Us" page can be cached for days (res.set('Cache-Control', 'public, max-age=86400')), while a product page might be cached for 15-30 minutes.
  - **Use stale-while-revalidate:** This header is pure magic. Cache-Control: s-maxage=600, stale-while-revalidate=3600 tells the CDN to serve a cached version for 10 minutes. If a request comes in after that, it serves the _stale_ content instantly (so the user gets a fast response) and then fetches a fresh version in the background. It's the perfect balance of speed and freshness.

- **Build Cache-Friendly Components:** To be [cached](/caching-in-the-sfcc-composable-storefront/), your server-rendered HTML needs to be generic for all users. Any personalised content (like the user's name or cart count) must _only_ be rendered on the client. A simple trick is to wrap it in a check:

    {typeof window!== 'undefined' && `<MyPersonalizedComponent />`}.

    This ensures it only renders in the browser.

- **Filter Useless Query Parameters:** Marketing URLs often contain "unnecessary" parameters, such as gclid and utm\_tags, which make every URL unique and prevent your cache from being effective. Edit the [processRequest](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/maximizing-your-cache-hit-ratio.html#filter-query-strings) function in app/request-processor.js to strip these parameters _before_ checking the cache. This allows thousands of different URLs to access the same cached page.
- **Cache Your APIs:** By default, proxied requests aren't cached by the CDN. This setting lets you use proxy requests in your code without worrying about accidentally caching responses. If you want a proxied request to be cached by the CDN, simply change the path prefix from proxy to caching.

Proxy Caching Caching proxies aren’t suitable for use with the B2C Commerce API. Instead use its Server-Side Web-Tier Caching feature.

### Tame the Third-Party Script Beast

[![A cartoon developer is taming a large 'beast' made of code and tangled wires. The developer is putting a collar labeled 'async' and holding a leash labeled 'defer' on the beast, while corralling other parts of it towards a pen labeled 'Lazy Load Zone'.](/media/2025/taming-the-third-party-script-beast-8cac515268.jpeg)](/media/2025/taming-the-third-party-script-beast-8cac515268.jpeg)

Taming the Third-Party Script Beast: A visual guide to managing external scripts for better web performance.

Third-party scripts are performance killers. You need to control them.

- **Audit and Justify:** Open Chrome DevTools and look at the Network panel. Make a list of every third-party script. For each one, ask: "Do we need this?" If the value doesn't outweigh the performance cost, eliminate it.
- **Load Asynchronously:** Never, ever load a third-party script synchronously. Always use the async or defer attribute. Async lets it download without blocking the page, and defer makes sure it only runs after the page has finished parsing.
- **Lazy Load Widgets:** For things like chat widgets or social media buttons, don't load them initially. Use JavaScript to load the script only when the user scrolls near it or clicks a placeholder.
- **Use a Consent Management Platform (CMP):** A good CMP integrated with Google Tag Manager (GTM) is a must-have. It stops marketing and ad tags from loading until the user gives consent. This is great for both privacy and performance.
- **Check Your Service Worker:** Your PWA's service worker might block requests to domains that aren't on its whitelist. When adding a new third-party script, ensure its domain is [configured](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/970a3343ba05b321f66ae62192172ea3a42380a7/packages/pwa-kit-runtime/src/utils/middleware/security.js#L28) correctly in your service worker to prevent blocking.

### Create Bulletproof, Lightning-Fast Images

Images are usually the heaviest part of a page. Optimising them is non-negotiable.

- **Serve Responsive Images:** Use the `<picture>` element or srcset and sizes attributes on your `<img>` tags. This allows the browser to select the perfect-sized image for the device, so a phone doesn't have to download a massive desktop image.
- **Use Modern Formats:** Use WebP format for images whenever possible. It provides significantly better compression than JPEG or PNG, often cutting file size by 25-35% without noticeable quality loss. Cloudflare only supports WebP. If you use a third-party image provider, check what's available, as there are now more modern options, including AVIF.
- **Compress, Compress, Compress:** Use an image optimisation service or build tools to compress your images. A JPEG quality of 85 is usually a great sweet spot.
- **Prevent Layout Shift with Dimensions:** This is a super-easy and effective fix for CLS. Always add width and height attributes to your `<img>` and `<video>` tags. This allows the browser to reserve the right amount of space before the media loads, preventing the annoying content jump.
- **Lazy Load Offscreen Images:** For any image that's not in the initial viewport, add the native loading="lazy" attribute. This instructs the browser to delay loading those images until the user scrolls down to them, which significantly improves performance.

## Step 4: Make it a Habit - Monitoring, Debugging, and Continuous Improvement

Performance isn't a one-and-done task. It's a discipline. You need a solid workflow to monitor, debug, and prevent problems from creeping back in.

### Your Performance-Sleuthing Toolkit

You have a powerful set of free tools to become a performance detective.

- **PageSpeed Insights (PSI):** This is your starting point. The top section, "Discover what your real users are experiencing," is your CrUX field data—your final report card. The bottom section, "Diagnose performance issues," is your lab data from Lighthouse. Use its "Opportunities" and "Diagnostics" to find the technical fixes you need to improve your field data scores.
- **Google Lighthouse:** Running Lighthouse from Chrome DevTools provides the most detailed results. Dig into the recommendations to find render-blocking resources, massive network payloads, and unused JavaScript. The "Progressive Web App" audit is also crucial for making sure your service worker and manifest are set up correctly.
- **Chrome DevTools:**

- **Performance Panel:** This is your primary tool for identifying INP issues. Record a page load or interaction to get a "flame chart" of everything the main thread is doing. Look for long tasks (marked with a red triangle) to find the exact JavaScript functions that are causing lag.
  - **Network Panel:** Use this to inspect all network requests. Check your Cache-Control headers, analyse asset sizes, and use "Request blocking" to temporarily disable third-party scripts to see how much damage they're doing.
  - **Application Panel:** This is your PWA command centre. Inspect your manifest, check your service worker's status, clear caches, and simulate being offline to test your app's reliability.

| Symptom / Poor Metric | Likely PWA Kit Cause(s) | Recommended Diagnostic Tool(s) | Actionable Solution(s) |
| --- | --- | --- | --- |
| **Poor LCP on Product Detail Page** | 1\. Large, unoptimized hero image. 2\. Slow, sequential API calls in getProps/useQuery during SSR. 3\. Low CDN cache hit ratio. | 1\. PageSpeed Insights to identify the LCP element. 2\. ?\_\_ server\_timing=true to check ssr:fetch-strategies time. 3\. MRT logs and CDN analytics. | 1\. Compress hero image, serve in WebP format, use srcset. 2\. Refactor data fetching to use Promise.all or a single aggregated API call. 3\. Set longer Cache-Control headers. |
| **Poor INP on Product Listing Page** | 1\. Long JavaScript task during client-side hydration. 2\. Excessive re-renders when applying filters. 3\. A blocking third-party analytics script. | 1\. DevTools Performance Panel to identify long tasks. 2\. React DevTools Profiler to visualize component renders. 3\. DevTools Network Panel to block the script and re-test. | 1\. Code-split the PLP's JavaScript. 2\. Use React.memo, useCallback, and useMemo on filter components. 3\. Defer or lazy-load the third-party script. |
| **High CLS on Homepage** | 1\. Images loading without width and height attributes. 2\. A cookie consent banner or ad injected dynamically. 3\. Web fonts causing a flash of unstyled text (FOUT). | 1\. Lighthouse audit to identify elements causing shifts. 2\. DevTools Performance Panel with "Screenshots" enabled to see the shifts happen. | 1\. Add explicit width and height to all `<img>` tags. 2\. Reserve space for the banner/ad with CSS. 3\. Preload key fonts using `<link rel="preload">`. |

### PWA Kit-Specific Debugging Tricks

The PWA Kit has some built-in secret weapons for debugging.

- **The \_\_ server\_timing Parameter:** Add ?\_\_ server\_timing=true to any URL in your dev environment. You'll get a Server-Timing header in the response that breaks down exactly how long each part of the SSR process took. It's perfect for figuring out if a slow response is because of a slow API or a heavy React component.
- **The ?\_\_ server\_only Parameter:** Use this parameter to see the pure, server-rendered version of a page without any client-side JavaScript. It's great for seeing what search engines see and for spotting layout shifts between the server and client versions.
- **Managed Runtime Log Center:** In production, the Log Center is your go-to for troubleshooting. You can search and filter logs from your app server to diagnose server-side errors and performance issues that only show up in the wild.

## Wrapping Up: Your Journey to a High-Performance Storefront

Building a blazingly fast storefront with the Salesforce PWA Kit isn't about finding one magic trick. It's a discipline. It requires understanding what users care about, knowing your architecture's strengths and weaknesses, and committing to a cycle of measuring, optimising, and monitoring.

In the cutthroat world of B2C commerce, that's not just a nice-to-have—it's the ultimate competitive advantage that drives real revenue.
