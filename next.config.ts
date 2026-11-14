import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships its own WASM/data files and must not be bundled by
  // Turbopack/webpack — it needs to be loaded as a real Node module.
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    // Server Actions default to a 1MB body limit, which is below our
    // own 5MB file-import cap (lib/documents/actions.ts). Without this,
    // a file between 1MB and 5MB fails with a raw framework error
    // instead of our "too-large" message.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
