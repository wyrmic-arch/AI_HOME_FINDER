/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /*
   * Future configuration:
   * - images.domains: whitelist for property photo CDN domains
   * - env: expose API keys (GOOGLE_MAPS_API_KEY, etc.)
   * - rewrites: proxy API calls to backend services
   */
};

module.exports = nextConfig;
