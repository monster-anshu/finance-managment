module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{js,html,css,ttf,ico,json,png}"],
  // The main JS chunk (~2.2 MB) is just over the 2 MB default limit.
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  swDest: "dist/sw.js",
  // SPA: serve the app shell for any route (e.g. /instrument/5) when offline.
  navigateFallback: "/index.html",
  // Activate new deploys on the next load instead of waiting for all tabs to close.
  skipWaiting: true,
  clientsClaim: true,
};
