import puppeteer from 'puppeteer';

// Cloud Run runs as root in a locked-down container without a sandbox, so
// --no-sandbox / --disable-setuid-sandbox are required (standard Puppeteer
// Docker recipe). We launch ONE browser instance per server process and
// reuse it across requests; each request gets its own page, closed after
// use, to avoid state leaking between renders.

let browserPromise = null;

async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });
}

export async function getBrowser() {
  if (!browserPromise) {
    browserPromise = launchBrowser();
  }
  let browser = await browserPromise;

  // If the browser crashed/disconnected (e.g. OOM), relaunch on next call.
  if (!browser.isConnected()) {
    browserPromise = launchBrowser();
    browser = await browserPromise;
  }
  return browser;
}

export async function renderPdfFromHtml(html) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Ensure @font-face assets (embedded as base64, but still parsed/laid
    // out asynchronously by Chromium) are fully loaded before printing.
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
    return pdfBuffer;
  } finally {
    await page.close();
  }
}

export async function closeBrowser() {
  if (!browserPromise) return;
  const browser = await browserPromise;
  await browser.close();
  browserPromise = null;
}
