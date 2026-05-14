const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const results = [];
    const routes = [
        { url: 'http://127.0.0.1:1313/archive/', type: 'archive' },
        { url: 'http://127.0.0.1:1313/posts/', type: 'archive' },
        { url: 'http://127.0.0.1:1313/how-to-use-ocapi-scapi-hooks/', type: 'article' }
    ];
    const widths = [700, 1400];
    const modes = ['full', 'critical'];

    for (const route of routes) {
        for (const mode of modes) {
            for (const width of widths) {
                const context = await browser.newContext({
                    viewport: { width, height: 1200 }
                });
                const page = await context.newPage();

                if (mode === 'critical') {
                    await page.route('**/*.css*', route => route.abort());
                }

                try {
                    await page.goto(route.url, { waitUntil: 'networkidle' });

                    const metrics = await page.evaluate((type) => {
                        const getStyle = (sel, prop) => {
                            const el = document.querySelector(sel);
                            return el ? getComputedStyle(el)[prop] : null;
                        };

                        const shell = document.querySelector('.site-main > .surface-shell');
                        const shellContainerName = shell ? getComputedStyle(shell).containerName || getComputedStyle(shell).getPropertyValue('--container-name') : null;

                        const common = {
                            innerWidth: window.innerWidth,
                            shellContainerName: shellContainerName
                        };

                        if (type === 'archive') {
                            return {
                                ...common,
                                gridTemplateAreas: getStyle('.archive-layout', 'gridTemplateAreas'),
                                gridTemplateColumns: getStyle('.archive-layout', 'gridTemplateColumns'),
                                mobileControlsDisplay: getStyle('.archive-controls__mobile', 'display'),
                                railDisplay: getStyle('.archive-rail', 'display')
                            };
                        } else {
                            return {
                                ...common,
                                articleBodyGridColumns: getStyle('.page-article__body', 'gridTemplateColumns'),
                                tocDesktopDisplay: getStyle('.article-toc--desktop', 'display'),
                                tocDesktopMaxHeight: getStyle('.article-toc--desktop', 'maxHeight'),
                                tocMobileDisplay: getStyle('.article-toc--mobile', 'display')
                            };
                        }
                    }, route.type);

                    results.push({
                        route: route.url,
                        mode,
                        width,
                        ...metrics
                    });
                } catch (e) {
                    results.push({ route: route.url, mode, width, error: e.message });
                }
                await context.close();
            }
        }
    }

    await browser.close();
    console.log(JSON.stringify(results, null, 2));
})();
