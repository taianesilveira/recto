import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships its own WASM/data files and must not be bundled by
  // Turbopack/webpack — it needs to be loaded as a real Node module.
  serverExternalPackages: ["@electric-sql/pglite"],
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
