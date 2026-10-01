import type { NextConfig } from "next";

/**
 * `npm run build:pages` produces a static copy of the site in `out/` for
 * GitHub Pages (https://<user>.github.io/<repo>/). Static hosting can't run
 * the POST /api/requests route, so that build only picks up `.tsx` files —
 * which leaves out the API route (and the .ts sitemap/robots) — and the
 * forms skip the server call and go straight to the WhatsApp hand-off.
 */
const isPagesBuild = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(isPagesBuild && {
    output: "export",
    basePath: process.env.PAGES_BASE_PATH ?? "/works-for-me",
    trailingSlash: true,
    images: { unoptimized: true },
    pageExtensions: ["tsx"],
  }),
};

export default nextConfig;
