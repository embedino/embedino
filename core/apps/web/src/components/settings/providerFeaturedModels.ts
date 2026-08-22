import type { ServerProviderModel } from "@embedino/contracts";

/**
 * How many models a provider shows (and leaves enabled) before the rest
 * collapse behind "View all models". Custom models the user added always
 * count as featured, so they are never hidden by this budget.
 */
export const FEATURED_MODEL_LIMIT = 6;

/**
 * Curated flagship-model patterns per driver kind. Providers move fast, so
 * these are intentionally loose prefixes over the well-known premium lines;
 * anything unmatched falls back to the first probes in server order.
 */
const FEATURED_MODEL_PATTERNS: Readonly<Record<string, ReadonlyArray<RegExp>>> = {
  codex: [/^gpt-5/],
  claudeAgent: [/claude-opus-5/, /claude-sonnet-5/, /claude-opus-4/],
  cursor: [/composer/, /^grok-/],
  grok: [/^grok-(code|4)/],
  opencode: [/gpt-5/, /claude-(opus|sonnet)-5/, /^gemini-3/],
};

/**
 * Picks the models a provider leads with: everything the user added
 * themselves, then pattern-matched flagships, then — when patterns miss
 * (unknown driver, renamed slugs) — the first probes in list order. Always
 * capped so the initial view stays short.
 */
export function selectFeaturedModelSlugs(
  driverKind: string | null,
  models: ReadonlyArray<ServerProviderModel>,
): ReadonlyArray<string> {
  const customSlugs = models.filter((model) => model.isCustom).map((model) => model.slug);
  const probeSlugs = models.filter((model) => !model.isCustom).map((model) => model.slug);
  const patterns = driverKind === null ? [] : (FEATURED_MODEL_PATTERNS[driverKind] ?? []);
  const matched = [
    ...new Set(patterns.flatMap((pattern) => probeSlugs.filter((slug) => pattern.test(slug)))),
  ];
  if (matched.length < 3) {
    matched.push(...probeSlugs);
  }
  return [...new Set([...customSlugs, ...matched])].slice(
    0,
    Math.max(FEATURED_MODEL_LIMIT, customSlugs.length),
  );
}
