/**
 * Central Embedino product feature switches.
 *
 * These flags turn features OFF without deleting them: disabled code paths stay
 * in the tree and can be re-enabled by flipping a flag here. They are plain
 * constants so bundlers can tree-shake disabled branches and so checks cost
 * nothing at runtime.
 *
 * - `connectCloud`: the "Embedino Connect" cloud suite (Clerk sign-in, cloud
 *   relay environment linking, managed tunnels, CLI OAuth). Local QR pairing
 *   against a running environment does not depend on this and stays available.
 * - `telemetryExport`: shipping analytics/traces off the user's machine
 *   (PostHog events, OTLP trace export). Local diagnostics stay available.
 * - `gitForge*`: source-control provider integrations for PR views.
 * - `remoteEnvironments`: SSH/remote-link environments ("Run on Remote").
 *   Hardware-first local workflows never need it; flip on for power users.
 */
export const EmbedinoFeatures = {
  connectCloud: false,
  telemetryExport: false,
  remoteEnvironments: false,
  gitForgeGitLab: false,
  gitForgeBitbucket: false,
  gitForgeAzureDevOps: false,
} as const;

export type EmbedinoFeatureName = keyof typeof EmbedinoFeatures;
