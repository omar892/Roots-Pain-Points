/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;

// Cloudflare next-on-pages: enable the dev platform bindings during `next dev`
// so local development matches the Pages edge runtime.
if (process.env.NODE_ENV === "development") {
  const { setupDevPlatform } = require("@cloudflare/next-on-pages/next-dev");
  setupDevPlatform().catch(console.error);
}
