// Next.js aliases the real "server-only" package to a no-op during its
// own build; outside that build (i.e. under Vitest) the real package
// throws unconditionally. This stub replaces it for tests only -- see
// the alias in vitest.config.ts.
export {};
