"use client";

import { ArrowUpCircleIcon, ChevronRightIcon, Trash2Icon } from "lucide-react";
import * as Arr from "effect/Array";
import * as Result from "effect/Result";
import type { ReactNode } from "react";
import {
  isProviderDriverKind,
  type ProviderDriverKind,
  type ProviderInstanceConfig,
  type ProviderInstanceId,
  type ServerProvider,
  type ServerProviderModel,
} from "@embedino/contracts";

import { cn } from "../../lib/utils";
import { normalizeProviderAccentColor } from "../../providerInstances";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { ProviderInstanceIcon } from "../chat/ProviderInstanceIcon";
import type { DriverOption } from "./providerDriverMeta";
import {
  getProviderSummary,
  getProviderVersionAdvisoryPresentation,
  getProviderVersionLabel,
  PROVIDER_STATUS_STYLES,
  type ProviderStatusKey,
} from "./providerStatus";

/**
 * Read a string[] at `key` from the opaque config blob, filtering out
 * non-string entries. Used for `customModels`, which is always typed as
 * `string[]` by the concrete driver schemas but arrives here as
 * `Schema.Unknown`.
 */
export function readConfigStringArray(config: unknown, key: string): ReadonlyArray<string> {
  if (config === null || typeof config !== "object") return [];
  const value = (config as Record<string, unknown>)[key];
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

export function deriveProviderModelsForDisplay(input: {
  readonly liveModels: ReadonlyArray<ServerProviderModel> | undefined;
  readonly customModels: ReadonlyArray<string>;
}): ReadonlyArray<ServerProviderModel> {
  const liveCustomModelsBySlug = new Map(
    Arr.filterMap(input.liveModels ?? [], (model) =>
      model.isCustom ? Result.succeed([model.slug, model] as const) : Result.failVoid,
    ),
  );
  const serverModels = input.liveModels?.filter((model) => !model.isCustom) ?? [];
  const customModels = input.customModels.map(
    (slug) =>
      liveCustomModelsBySlug.get(slug) ?? {
        slug,
        name: slug,
        isCustom: true,
        capabilities: null,
      },
  );
  return [...serverModels, ...customModels];
}

interface ProviderInstanceCardProps {
  readonly instanceId: ProviderInstanceId;
  readonly instance: ProviderInstanceConfig;
  readonly driverOption: DriverOption | undefined;
  readonly liveProvider: ServerProvider | undefined;
  /** Invoked when any non-control part of the row is activated. */
  readonly onOpenSettings: () => void;
  readonly onUpdate: (nextInstance: ProviderInstanceConfig) => void;
  /**
   * Pass `undefined` to hide the delete button entirely. Built-in default
   * instance slots use `undefined` — they can't be deleted without losing
   * the slot, and their "reset to defaults" affordance lives on an outer
   * reset button instead. Explicit `| undefined` in the type accommodates
   * `exactOptionalPropertyTypes: true`, where an absent key and
   * `{ onDelete: undefined }` are treated as distinct shapes.
   */
  readonly onDelete?: (() => void) | undefined;
  /**
   * Optional outer reset action rendered inline on the row. Built-in
   * default slots supply a reset-to-factory control here; custom instances
   * omit it.
   */
  readonly headerAction?: ReactNode | undefined;
}

/**
 * A single configured provider-instance row in the Providers settings
 * section — designed to sit inside a shared bordered list container.
 *
 * The row stays minimal: icon tile, name with version chip, one status
 * line, enable switch. Activating it anywhere opens
 * `ProviderInstanceSettingsDialog`, which owns every editing concern; the
 * list itself never expands or reflows.
 *
 * Behavior notes:
 *   - `liveProvider` is matched by the caller via `instanceId`; when no
 *     match is available (e.g. the server hasn't probed yet, or the driver
 *     is not shipped by the current build) the row still renders with a
 *     neutral "checking" status.
 *   - A user-assigned `accentColor` renders as a slim stripe on the row's
 *     leading edge, mirroring how the instance is marked inside model
 *     picker rails.
 */
export function ProviderInstanceCard({
  instanceId,
  instance,
  driverOption,
  liveProvider,
  onOpenSettings,
  onUpdate,
  onDelete,
  headerAction,
}: ProviderInstanceCardProps) {
  const enabled = instance.enabled ?? true;
  // The server-reported status wins when present; otherwise fall back to
  // "disabled"/"warning" based on the local `enabled` flag so the dot
  // reflects the persisted intent even before the first probe completes.
  const statusKey: ProviderStatusKey =
    (liveProvider?.status as ProviderStatusKey | undefined) ?? (enabled ? "warning" : "disabled");
  const statusStyle = PROVIDER_STATUS_STYLES[statusKey];
  const summary = getProviderSummary(liveProvider);
  const authEmail = liveProvider?.auth.email;
  const hasAuthenticatedEmail =
    liveProvider?.auth.status === "authenticated" && Boolean(authEmail?.trim());
  const authenticatedDetail = hasAuthenticatedEmail
    ? (liveProvider?.auth.label ?? liveProvider?.auth.type ?? null)
    : null;
  const versionAdvisory = getProviderVersionAdvisoryPresentation(liveProvider?.versionAdvisory);
  const versionLabel = getProviderVersionLabel(liveProvider?.version);

  // Narrow `instance.driver` for callers that key on the closed
  // `ProviderDriverKind` union. Custom fork drivers pass through as `null`.
  const driverKind: ProviderDriverKind | null = isProviderDriverKind(instance.driver)
    ? instance.driver
    : null;

  const displayName =
    instance.displayName?.trim() || driverOption?.label || String(instance.driver);
  const accentColor = normalizeProviderAccentColor(instance.accentColor);

  const updateEnabled = (value: boolean) => {
    onUpdate({ ...instance, enabled: value });
  };

  const openSettingsLabel = `Open ${displayName} settings`;

  return (
    <div className="group relative transition-colors hover:bg-accent/30">
      {accentColor ? (
        <span
          aria-hidden
          className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full"
          style={{ backgroundColor: accentColor }}
        />
      ) : null}
      <div
        className={cn(
          "flex items-center gap-3 py-2.5 pr-3 pl-4 sm:pl-5",
          accentColor && "pl-[19px] sm:pl-[23px]",
        )}
      >
        <button
          type="button"
          className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border/50 bg-background transition-colors hover:bg-accent/40"
          onClick={onOpenSettings}
          aria-label={openSettingsLabel}
        >
          {iconNode({
            driverKind,
            driverOption,
            displayName,
            accentColor,
            statusDotClassName: statusStyle.dot,
          })}
        </button>

        <button
          type="button"
          className="flex min-w-0 flex-1 cursor-pointer flex-col gap-y-0.5 text-left"
          onClick={onOpenSettings}
          aria-label={openSettingsLabel}
        >
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <h3 className="truncate text-sm font-medium tracking-[-0.005em] text-foreground">
              {displayName}
            </h3>
            {String(instanceId) !== String(instance.driver) ? (
              <code className="hidden truncate rounded bg-muted/60 px-1 py-0.5 text-[10px] text-muted-foreground sm:inline">
                {instanceId}
              </code>
            ) : null}
            {driverOption?.badgeLabel ? (
              <Badge variant="warning" size="sm" className="shrink-0">
                {driverOption.badgeLabel}
              </Badge>
            ) : null}
            {versionLabel ? (
              <code className="hidden shrink-0 rounded-md bg-muted/70 px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted-foreground sm:inline-block">
                {versionLabel}
              </code>
            ) : null}
          </span>
          <span className="truncate text-xs text-muted-foreground/80">
            {summary.headline}
            {authenticatedDetail ? ` · ${authenticatedDetail}` : ""}
          </span>
        </button>

        {versionAdvisory ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md p-0"
                  onClick={onOpenSettings}
                  aria-label="Update available — open settings for details"
                >
                  <ArrowUpCircleIcon
                    className={cn(
                      "size-4",
                      versionAdvisory.emphasis === "strong"
                        ? "text-warning"
                        : "text-update-foreground",
                    )}
                  />
                </button>
              }
            />
            <TooltipPopup side="top">{versionAdvisory.detail}</TooltipPopup>
          </Tooltip>
        ) : null}

        {headerAction ? (
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
            {headerAction}
          </span>
        ) : null}
        {onDelete ? (
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="size-5 rounded-sm p-0 text-muted-foreground hover:text-destructive"
                    onClick={onDelete}
                    aria-label={`Delete provider instance ${instanceId}`}
                  >
                    <Trash2Icon className="size-3" />
                  </Button>
                }
              />
              <TooltipPopup side="top">Delete instance</TooltipPopup>
            </Tooltip>
          </span>
        ) : null}

        <Switch
          checked={enabled}
          onCheckedChange={(checked) => updateEnabled(Boolean(checked))}
          aria-label={`Enable ${displayName}`}
        />

        <ChevronRightIcon
          className="w-4 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>
    </div>
  );
}

function iconNode(props: {
  readonly driverKind: ProviderDriverKind | null;
  readonly driverOption: DriverOption | undefined;
  readonly displayName: string;
  readonly accentColor: string | undefined;
  readonly statusDotClassName: string;
}): ReactNode {
  if (props.driverKind) {
    return (
      <ProviderInstanceIcon
        driverKind={props.driverKind}
        displayName={props.displayName}
        accentColor={props.accentColor}
        showBadge={Boolean(props.accentColor)}
        statusDotClassName={props.statusDotClassName}
        indicatorBackground="var(--card)"
        className="size-9"
        iconClassName="size-[18px] text-foreground/80"
        badgeClassName="right-[-0.125rem] bottom-[-0.125rem] h-3.5 min-w-3.5 px-0.5 text-[8px]"
      />
    );
  }
  if (props.driverOption) {
    const Icon = props.driverOption.icon;
    return (
      <span className="relative inline-flex size-9 items-center justify-center">
        <Icon className="size-[18px] text-foreground/80" aria-hidden />
        <span
          className={cn(
            "pointer-events-none absolute -left-0.5 -top-0.5 size-2.5 rounded-full ring-2 ring-card",
            props.statusDotClassName,
          )}
          aria-hidden
        />
      </span>
    );
  }
  return <span className={cn("size-2.5 shrink-0 rounded-full", props.statusDotClassName)} />;
}
