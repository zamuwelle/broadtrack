# Performance and SEO

BroadTrack uses these measures to keep pages fast, readable, and discoverable:

- Equipment images load as they approach the screen. Team portraits use WebP images sized for their display.
- The landing page preloads its main image and two Poppins font weights to help content appear sooner.
- Images include dimensions where needed to reserve space while the page loads.
- Headings, button labels, and text contrast help people navigate and read the app.
- [`robots.txt`](../../frontend/web/public/robots.txt) allows search engines to crawl the site. Page titles and descriptions are set in [`index.html`](../../frontend/web/index.html).
- [`llms.txt`](../../frontend/web/public/llms.txt) summarizes the public pages for AI agents. [`ard.json`](../../frontend/web/public/ard.json) is an empty agent resource catalog; the app does not advertise agent tools.

## Check a page

1. Open the page in Google Chrome and sign in if needed.
2. Open Developer Tools and select **Lighthouse**.
3. Choose **Mobile** or **Desktop**, select the categories to check, and run the analysis.

You can also check public pages with [PageSpeed Insights](https://pagespeed.web.dev/). Test the landing page, other public pages, and signed-in pages separately. Results can vary between runs and devices.
