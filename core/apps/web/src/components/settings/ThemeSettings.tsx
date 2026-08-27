import { cn } from "../../lib/utils";
import { getThemeDefinition, type ThemeAppearance, type ThemeHalves } from "../../themePalette";
import { stackedThreadToast, toastManager } from "../ui/toast";
import {
  getThemeCardDefinition,
  previewColorsOf,
  STANDARD_THEME_CARDS,
  type ThemeMode,
} from "./ThemePreviewCircles";
import { ThemeWireframe } from "./ThemeWireframe";

export function ThemeLibrary({
  appearanceMode,
  setAppearanceMode,
  theme,
  themeHalves,
}: {
  appearanceMode: ThemeMode;
  setAppearanceMode: (mode: ThemeMode) => boolean;
  theme: string;
  themeHalves: ThemeHalves | null;
}) {
  const baseCardId = getThemeDefinition(theme)?.id ?? null;
  const lightOwner = themeHalves?.light ?? baseCardId;
  const darkOwner = themeHalves?.dark ?? baseCardId;

  const pickColors = (id: string | null, appearance: ThemeAppearance) => {
    const definition = id === null ? null : getThemeDefinition(id);
    const card = definition ? getThemeCardDefinition(definition) : STANDARD_THEME_CARDS[0]!;
    return previewColorsOf(card, appearance) ?? card.previews[0]!.colors;
  };

  const wireframeColors = (appearance: ThemeAppearance) =>
    pickColors(appearance === "light" ? lightOwner : darkOwner, appearance);

  const renderWireframe = (mode: ThemeMode) => (
    <ThemeWireframe
      className="h-[8.75rem]"
      panes={
        mode === "system"
          ? [
              { clip: "left", colors: wireframeColors("light") },
              { clip: "right", colors: wireframeColors("dark") },
            ]
          : [{ colors: wireframeColors(mode === "dark" ? "dark" : "light") }]
      }
    />
  );

  const setMode = (mode: ThemeMode) => {
    if (!setAppearanceMode(mode)) {
      toastManager.add(
        stackedThreadToast({
          type: "error",
          title: "Couldn’t save color scheme",
          description: "Try again.",
        }),
      );
    }
  };

  return (
    <div className="space-y-3">
      <p className="px-3 text-[13px] leading-[1.45] text-muted-foreground/80 sm:px-4">
        Choose how Embedino looks.
      </p>
      <h3 className="px-3 text-sm font-medium tracking-[-0.005em] text-foreground sm:px-4">
        Color scheme
      </h3>
      <div
        aria-label="Appearance mode"
        className="mx-auto grid w-full max-w-[56rem] grid-cols-3 gap-3 px-3 sm:px-4"
        role="group"
      >
        {(["system", "light", "dark"] as const).map((mode) => {
          const isActive = appearanceMode === mode;
          return (
            <button
              aria-label={mode === "system" ? "Follow the system appearance" : `Use ${mode} mode`}
              aria-pressed={isActive}
              className={cn(
                "flex cursor-pointer flex-col items-stretch gap-1.5 rounded-xl border p-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-transparent bg-accent/30"
                  : "border-border/70 bg-card/60 hover:bg-accent/10",
              )}
              key={mode}
              style={isActive ? { boxShadow: "inset 0 0 0 1px var(--ring)" } : undefined}
              onClick={() => setMode(mode)}
              type="button"
            >
              {renderWireframe(mode)}
              <span
                className={cn(
                  "flex items-center justify-center text-xs font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {mode === "system" ? "System" : mode === "light" ? "Light" : "Dark"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
