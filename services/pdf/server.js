import express from 'express';
import { RenderRequestSchema } from './lib/schema.js';
import { resolveTheme } from './lib/themes.js';
import { renderTemplate } from './templates/index.js';
import { renderPdfFromHtml, closeBrowser, getBrowser } from './lib/browser.js';

const PORT = process.env.PORT || 8080;
// Cap request size — CV JSON is small (a few KB), this guards against abuse.
const JSON_BODY_LIMIT = '2mb';

const app = express();
app.use(express.json({ limit: JSON_BODY_LIMIT }));

app.get('/healthz', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post('/render', async (req, res) => {
  const parsed = RenderRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'invalid_request',
      issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }

  const { cv, template, theme: themeInput, locale } = parsed.data;
  const theme = resolveTheme(themeInput);

  try {
    const html = renderTemplate(template, cv, theme, locale);
    const pdfBuffer = await renderPdfFromHtml(html);

    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="cv-${locale}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[pdf-service] render failed:', err);
    res.status(500).json({ error: 'render_failed', message: err?.message || 'Unknown error' });
  }
});

// 404 for anything else.
app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[pdf-service] listening on :${PORT}`);
  // Warm the browser at boot so the first real request isn't penalized by
  // Chromium launch time (helps Cloud Run cold starts stay predictable).
  getBrowser().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[pdf-service] browser warm-up failed:', err);
  });
});

async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`[pdf-service] received ${signal}, shutting down`);
  server.close();
  await closeBrowser();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
