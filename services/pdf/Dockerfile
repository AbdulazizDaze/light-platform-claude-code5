# Light PDF rendering service — Cloud Run + Puppeteer/Chromium.
# Standard Puppeteer Docker recipe (Debian slim + Chromium system deps),
# adapted for Cloud Run: listens on $PORT, scale-to-zero friendly (no
# background workers besides the single reused browser process).

FROM node:20-slim

# Chromium runtime dependencies (standard Puppeteer troubleshooting list for
# Debian-based images) + fonts-liberation for Latin fallback glyphs.
# Noto Sans / Noto Sans Arabic are bundled as embedded webfonts in
# services/pdf/fonts, so no system Arabic font package is required, but
# libnss3/libxss1/etc. are needed for headless Chromium to run at all.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer downloads its own matching Chromium build at `npm install` time
# (default behavior — we do NOT set PUPPETEER_SKIP_DOWNLOAD), so the exact
# browser build always matches the pinned puppeteer version in package.json.
ENV PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer

WORKDIR /app

# Install deps first for better layer caching.
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# App code (server, lib, templates, bundled fonts).
COPY server.js ./
COPY lib ./lib
COPY templates ./templates
COPY fonts ./fonts

# Run as a non-root user (Chromium refuses --no-sandbox as root in some
# configs; this also follows Cloud Run/Docker best practice).
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/.cache/puppeteer \
    && chown -R pptruser:pptruser /home/pptruser /app

USER pptruser

ENV NODE_ENV=production
# Cloud Run injects PORT; default kept for local `docker run`.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
