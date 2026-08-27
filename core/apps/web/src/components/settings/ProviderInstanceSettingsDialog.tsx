"use client";

import {
  ArrowUpCircleIcon,
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  LoaderIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  isProviderDriverKind,
  type ProviderDriverKind,
  type ProviderInstanceConfig,
  type ProviderInstanceEnvironmentVariable,
  type ProviderInstanceId,
  type ServerProvider,
} from "@embedino/contracts";

import { cn } from "../../lib/utils";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { normalizeProviderAccentColor } from "../../providerInstances";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "../ui/dialog";
import { DraftInput } from "../ui/draft-input";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { stackedThreadToast, toastManager } from "../ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { ProviderInstanceIcon } from "../chat/ProviderInstanceIcon";
import { type Icon } from "../Icons";
import type { DriverOption } from "./providerDriverMeta";
import { deriveProviderModelsForDisplay, readConfigStringArray } from "./ProviderInstanceCard";
import { ProviderAccentColorPicker } from "./ProviderAccentColorPicker";
import { ProviderSettingsForm } from "./ProviderSettingsForm";
import { ProviderModelsSection } from "./ProviderModelsSection";
import { RedactedSensitiveText } from "./RedactedSensitiveText";
import {
  getProviderSummary,
  getProviderVersionAdvisoryPresentation,
  getProviderVersionLabel,
  PROVIDER_STATUS_STYLES,
  type ProviderStatusKey,
} from "./providerStatus";

const ENVIRONMENT_VARIABLE_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

let environmentVariableDraftId = 0;
const nextEnvironmentVariableDraftId = () => `provider-env-${environmentVariableDraftId++}`;

type EnvironmentDraftRow = {
  readonly id: string;
  readonly name: string;
  readonly value: string;
  readonly sensitive: boolean;
  readonly valueRedacted?: boolean;
};

function makeEnvironmentDraftRow(
  variable: ProviderInstanceEnvironmentVariable,
  index: number,
): EnvironmentDraftRow {
  return {
    id: `${index}:${variable.name}`,
    name: variable.name,
    value: variable.value,
    sensitive: variable.sensitive,
    ...(variable.valueRedacted !== undefined ? { valueRedacted: variable.valueRedacted } : {}),
  };
}

/**
 * Set `key` to an arbitrary value on the opaque config blob. Unlike
 * provider settings field updates, does not drop empty-looking values — the
 * caller is responsible for deciding whether an empty array / empty
 * object should be stored explicitly (e.g. `customModels: []` is a
 * meaningful "user cleared their custom list" state distinct from
 * "driver default").
 */
function nextConfigBlobWithValue(
  config: unknown,
  key: string,
  value: unknown,
): Record<string, unknown> {
  const base: Record<string, unknown> =
    config !== null && typeof config === "object" ? { ...(config as Record<string, unknown>) } : {};
  base[key] = value;
  return base;
}

function ProviderAuthEmail(props: {
  readonly email: string | undefined;
  readonly prefix?: string;
  readonly separator?: boolean;
}) {
  const trimmed = props.email?.trim();
  if (!trimmed) return null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      {props.separator ? <span aria-hidden>·</span> : null}
      {props.prefix ? <span className="text-muted-foreground/80">{props.prefix}</span> : null}
      <RedactedSensitiveText
        value={trimmed}
        ariaLabel="Toggle account email visibility"
        revealTooltip="Click to reveal email"
        hideTooltip="Click to hide email"
      />
    </span>
  );
}

function ProviderEnvironmentSection(props: {
  readonly environment: ReadonlyArray<ProviderInstanceEnvironmentVariable>;
  readonly onChange: (environment: ReadonlyArray<ProviderInstanceEnvironmentVariable>) => void;
}) {
  const [rows, setRows] = useState<ReadonlyArray<EnvironmentDraftRow>>(() =>
    props.environment.map(makeEnvironmentDraftRow),
  );

  const publishRows = (nextRows: ReadonlyArray<EnvironmentDraftRow>) => {
    const published: ProviderInstanceEnvironmentVariable[] = [];
    for (const row of nextRows) {
      const name = row.name.trim();
      if (!ENVIRONMENT_VARIABLE_NAME_PATTERN.test(name)) {
        if (
          name.length > 0 ||
          row.value.length > 0 ||
          row.sensitive !== true ||
          row.valueRedacted !== undefined
        ) {
          return;
        }
        continue;
      }
      const { id: _id, ...rest } = row;
      published.push({ ...rest, name });
    }
    props.onChange(published);
  };

  const updateVariable = (id: string, patch: Partial<Omit<EnvironmentDraftRow, "id">>) => {
    const nextRows = rows.map((row) =>
      row.id === id
        ? {
            ...row,
            ...patch,
            ...(patch.value !== undefined ? { valueRedacted: false } : {}),
          }
        : row,
    );
    setRows(nextRows);
    publishRows(nextRows);
  };

  const removeVariable = (id: string) => {
    const nextRows = rows.filter((row) => row.id !== id);
    setRows(nextRows);
    publishRows(nextRows);
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Environment variables
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={() =>
            setRows([
              ...rows,
              {
                id: nextEnvironmentVariableDraftId(),
                name: "",
                value: "",
                sensitive: true,
              },
            ])
          }
        >
          <PlusIcon className="size-3" />
          Add
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Add variables to pass API keys, base URLs, or other per-instance CLI settings.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-border/70">
          <Table>
            <TableHeader className="bg-muted/25 text-[11px] text-muted-foreground">
              <TableRow className="hover:bg-transparent">
                <TableHead>Variable</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-20">Sensitive</TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Options</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((variable, index) => (
                <TableRow
                  key={variable.id}
                  className="border-border/60 odd:bg-muted/20 even:bg-background/20"
                >
                  <TableCell>
                    <DraftInput
                      value={variable.name}
                      onCommit={(name) => updateVariable(variable.id, { name: name.trim() })}
                      placeholder="VARIABLE_NAME"
                      spellCheck={false}
                      aria-label={`Environment variable name ${index + 1}`}
                    />
                  </TableCell>
                  <TableCell>
                    <DraftInput
                      value={variable.valueRedacted ? "" : variable.value}
                      onCommit={(value) => updateVariable(variable.id, { value })}
                      type={variable.sensitive ? "password" : undefined}
                      autoComplete="off"
                      placeholder={
                        variable.valueRedacted
                          ? "Stored secret - enter a new value to replace"
                          : "Value"
                      }
                      spellCheck={false}
                      aria-label={`Environment variable value ${index + 1}`}
                    />
                  </TableCell>
                  <TableCell className="w-20">
                    <div className="flex h-8 items-center justify-center">
                      <Checkbox
                        checked={variable.sensitive}
                        onCheckedChange={(checked) => {
                          const sensitive = Boolean(checked);
                          updateVariable(variable.id, {
                            sensitive,
                            ...(sensitive && variable.valueRedacted === undefined
                              ? {}
                              : { valueRedacted: sensitive ? variable.valueRedacted : false }),
                          });
                        }}
                        aria-label={`Mark environment variable ${variable.name || index + 1} as sensitive`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="w-12">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeVariable(variable.id)}
                        aria-label={`Remove environment variable ${variable.name || index + 1}`}
                      >
                        <XIcon className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <span className="text-xs text-muted-foreground">
        Sensitive values are stored separately and are not returned to the app after saving.
      </span>
    </div>
  );
}

function SettingsGroup(props: {
  readonly title: string;
  readonly action?: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <section className={cn("grid gap-3", props.className)}>
      <div className="flex min-h-5 items-center justify-between gap-3">
        <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {props.title}
        </h4>
        {props.action}
      </div>
      {props.children}
    </section>
  );
}

const ADVANCED_SUMMARY = "Display name · Accent color · Environment variables";

interface ProviderInstanceSettingsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly instanceId: ProviderInstanceId;
  readonly instance: ProviderInstanceConfig;
  readonly driverOption: DriverOption | undefined;
  readonly liveProvider: ServerProvider | undefined;
  readonly onUpdate: (nextInstance: ProviderInstanceConfig) => void;
  /**
   * Pass `undefined` to hide the remove action entirely. Built-in default
   * instance slots use `undefined` — they can't be deleted without losing
   * the slot, and their "reset to defaults" affordance arrives via
   * `resetAction`.
   */
  readonly onDelete?: (() => void) | undefined;
  /** Optional reset-to-factory control for built-in default slots. */
  readonly resetAction?: ReactNode | undefined;
  readonly hiddenModels: ReadonlyArray<string>;
  readonly favoriteModels: ReadonlyArray<string>;
  readonly modelOrder: ReadonlyArray<string>;
  readonly onHiddenModelsChange: (next: ReadonlyArray<string>) => void;
  readonly onFavoriteModelsChange: (next: ReadonlyArray<string>) => void;
  readonly onModelOrderChange: (next: ReadonlyArray<string>) => void;
  readonly onRunUpdate?: (() => void) | undefined;
  readonly isUpdating?: boolean | undefined;
}

/**
 * Full-screen-quality editing surface for one provider instance, presented
 * as a centered dialog so the providers list never reflows. Owns every
 * per-instance concern: auth/version status, driver configuration, model
 * management, and the rarely-touched identity + environment controls under
 * a collapsed Advanced group.
 */
export function ProviderInstanceSettingsDialog({
  open,
  onOpenChange,
  instanceId,
  instance,
  driverOption,
  liveProvider,
  onUpdate,
  onDelete,
  resetAction,
  hiddenModels,
  favoriteModels,
  modelOrder,
  onHiddenModelsChange,
  onFavoriteModelsChange,
  onModelOrderChange,
  onRunUpdate,
  isUpdating = false,
}: ProviderInstanceSettingsDialogProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const enabled = instance.enabled ?? true;
  // Mirrors the row's status derivation: the server-reported status wins
  // when present; otherwise fall back to "disabled"/"warning" based on the
  // local `enabled` flag so the header reflects persisted intent even
  // before the first probe completes.
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
  const versionLabel = getProviderVersionLabel(liveProvider?.version);
  const versionAdvisory = getProviderVersionAdvisoryPresentation(liveProvider?.versionAdvisory);
  const updateCommand = versionAdvisory?.updateCommand ?? null;

  // Narrow `instance.driver` for callers that key on the closed
  // `ProviderDriverKind` union (e.g. `normalizeModelSlug`'s alias table).
  // Custom fork drivers pass through as `null` and those callers fall back
  // to verbatim behaviour.
  const driverKind: ProviderDriverKind | null = isProviderDriverKind(instance.driver)
    ? instance.driver
    : null;

  const displayName =
    instance.displayName?.trim() || driverOption?.label || String(instance.driver);
  const accentColor = normalizeProviderAccentColor(instance.accentColor);

  const { copyToClipboard } = useCopyToClipboard<{ providerName: string }>({
    onCopy: ({ providerName }) => {
      toastManager.add({
        type: "success",
        title: `${providerName} update command copied`,
        description: "Run it in a terminal when you are ready to update.",
      });
    },
    onError: (error, { providerName }) => {
      toastManager.add(
        stackedThreadToast({
          type: "error",
          title: `Could not copy ${providerName} update command`,
          description: error.message,
        }),
      );
    },
  });

  const customModels = readConfigStringArray(instance.config, "customModels");
  // Server-returned models may lag behind settings writes. Treat probe
  // models as the source for built-ins only; custom rows come directly
  // from the current instance config so add/remove reflects immediately.
  const modelsForDisplay = deriveProviderModelsForDisplay({
    liveModels: liveProvider?.models,
    customModels,
  });

  const updateDisplayName = (value: string) => {
    const trimmed = value.trim();
    const { displayName: _omit, ...rest } = instance;
    onUpdate(
      trimmed.length > 0
        ? ({ ...rest, displayName: trimmed } as ProviderInstanceConfig)
        : (rest as ProviderInstanceConfig),
    );
  };

  const updateAccentColor = (value: string) => {
    const normalized = normalizeProviderAccentColor(value);
    const { accentColor: _omit, ...rest } = instance;
    onUpdate(
      normalized
        ? ({ ...rest, accentColor: normalized } as ProviderInstanceConfig)
        : (rest as ProviderInstanceConfig),
    );
  };

  const updateConfig = (nextConfig: Record<string, unknown> | undefined) => {
    const { config: _omit, ...rest } = instance;
    onUpdate(
      nextConfig !== undefined
        ? ({ ...rest, config: nextConfig } as ProviderInstanceConfig)
        : (rest as ProviderInstanceConfig),
    );
  };

  const updateCustomModels = (next: ReadonlyArray<string>) => {
    const nextConfig = nextConfigBlobWithValue(instance.config, "customModels", [...next]);
    const { config: _omit, ...rest } = instance;
    onUpdate({ ...rest, config: nextConfig } as ProviderInstanceConfig);
  };

  const updateEnvironment = (environment: ReadonlyArray<ProviderInstanceEnvironmentVariable>) => {
    const cleaned = environment.filter((variable) => variable.name.trim().length > 0);
    const { environment: _omit, ...rest } = instance;
    onUpdate(
      cleaned.length > 0
        ? ({ ...rest, environment: cleaned } as ProviderInstanceConfig)
        : (rest as ProviderInstanceConfig),
    );
  };

  const headerIcon = driverKind ? (
    <ProviderInstanceIcon
      driverKind={driverKind}
      displayName={displayName}
      accentColor={accentColor}
      showBadge={Boolean(accentColor)}
      statusDotClassName={statusStyle.dot}
      indicatorBackground="var(--card)"
      className="size-9"
      iconClassName="size-5 text-foreground/80"
      badgeClassName="right-[-0.125rem] bottom-[-0.125rem] h-3.5 min-w-3.5 px-0.5 text-[8px]"
    />
  ) : driverOption ? (
    <FallbackHeaderIcon icon={driverOption.icon} dotClassName={statusStyle.dot} />
  ) : (
    <span className={cn("size-2.5 shrink-0 rounded-full", statusStyle.dot)} />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-border/50 bg-background">
              {headerIcon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                <DialogTitle className="truncate text-base">{displayName}</DialogTitle>
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
              </div>
              <DialogDescription className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                <span className="min-w-0 truncate">{summary.headline}</span>
                {hasAuthenticatedEmail ? <ProviderAuthEmail email={authEmail} separator /> : null}
                {authenticatedDetail ? (
                  <span className="truncate">· {authenticatedDetail}</span>
                ) : null}
                {versionLabel ? (
                  <code className="shrink-0 text-[11px] text-muted-foreground">{versionLabel}</code>
                ) : null}
              </DialogDescription>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) => onUpdate({ ...instance, enabled: Boolean(checked) })}
              aria-label={`Enable ${displayName}`}
            />
          </div>
        </DialogHeader>

        <DialogPanel>
          {versionAdvisory ? (
            <div
              className={cn(
                "mb-5 grid gap-2 rounded-lg border p-3",
                versionAdvisory.emphasis === "strong"
                  ? "border-warning/40 bg-warning/5"
                  : "border-border/70 bg-muted/30",
              )}
            >
              <p
                className={cn(
                  "flex items-start gap-1.5 text-xs leading-snug",
                  versionAdvisory.emphasis === "strong" ? "text-warning" : "text-muted-foreground",
                )}
              >
                <ArrowUpCircleIcon className="mt-0.5 size-3.5 shrink-0" />
                <span>{versionAdvisory.detail}</span>
              </p>
              {onRunUpdate ? (
                <div>
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    disabled={isUpdating}
                    onClick={onRunUpdate}
                  >
                    {isUpdating ? <LoaderIcon className="animate-spin" /> : <DownloadIcon />}
                    {isUpdating ? "Updating" : "Update now"}
                  </Button>
                </div>
              ) : null}
              {onRunUpdate && updateCommand ? (
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  or update manually using
                </p>
              ) : null}
              {updateCommand ? (
                <div className="flex max-w-md min-w-0 items-center gap-1 rounded-md border border-border/70 bg-muted/40 py-0.5 pr-0.5 pl-2">
                  <ScrollArea scrollFade className="h-8 min-w-0 flex-1 rounded-none">
                    <code className="flex h-full w-max items-center whitespace-nowrap pr-3 font-mono text-[11px] text-foreground">
                      {updateCommand}
                    </code>
                  </ScrollArea>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          className="size-6 shrink-0 rounded-sm p-0 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            copyToClipboard(updateCommand, {
                              providerName: displayName,
                            })
                          }
                          aria-label="Copy update command"
                        >
                          <CopyIcon className="size-3" />
                        </Button>
                      }
                    />
                    <TooltipPopup side="top">Copy command</TooltipPopup>
                  </Tooltip>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="divide-y divide-border/40">
            {driverOption ? (
              <>
                <SettingsGroup title="Configuration" className="py-5 first:pt-0">
                  <ProviderSettingsForm
                    definition={driverOption}
                    value={instance.config}
                    idPrefix={`provider-instance-${instanceId}`}
                    variant="dialog"
                    onChange={updateConfig}
                  />
                </SettingsGroup>

                <SettingsGroup
                  title="Models"
                  className="py-5 last:pb-0"
                  action={
                    <span className="text-[11px] text-muted-foreground">
                      {modelsForDisplay.length} available
                    </span>
                  }
                >
                  <ProviderModelsSection
                    instanceId={instanceId}
                    driverKind={driverKind}
                    models={modelsForDisplay}
                    customModels={customModels}
                    hiddenModels={hiddenModels}
                    favoriteModels={favoriteModels}
                    modelOrder={modelOrder}
                    onChange={updateCustomModels}
                    onHiddenModelsChange={onHiddenModelsChange}
                    onFavoriteModelsChange={onFavoriteModelsChange}
                    onModelOrderChange={onModelOrderChange}
                  />
                </SettingsGroup>
              </>
            ) : (
              <SettingsGroup title="Configuration" className="py-5 first:pt-0">
                <p className="text-xs text-muted-foreground">
                  This instance uses a driver (
                  <code className="text-foreground">{String(instance.driver)}</code>) that is not
                  shipped with the current build. Configuration values are preserved but cannot be
                  edited from this surface.
                </p>
              </SettingsGroup>
            )}

            <div className="py-5 last:pb-0">
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-left transition-colors hover:bg-muted/40"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  aria-expanded={isAdvancedOpen}
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-foreground">Advanced</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {ADVANCED_SUMMARY}
                    </span>
                  </span>
                  <ChevronDownIcon
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isAdvancedOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                <CollapsibleContent>
                  <div className="space-y-5 pt-5">
                    <label
                      htmlFor={`provider-instance-${instanceId}-display-name`}
                      className="grid gap-1.5"
                    >
                      <span className="text-xs font-medium text-foreground">Display name</span>
                      <DraftInput
                        id={`provider-instance-${instanceId}-display-name`}
                        value={instance.displayName ?? ""}
                        onCommit={updateDisplayName}
                        placeholder={driverOption?.label ?? "Instance label"}
                        spellCheck={false}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        Optional label shown in the provider list.
                      </span>
                    </label>

                    <ProviderAccentColorPicker
                      displayName={displayName}
                      value={accentColor}
                      onCommit={updateAccentColor}
                      commitDelayMs={120}
                      description="Used to distinguish this instance in picker rails and model lists."
                    />

                    <ProviderEnvironmentSection
                      environment={instance.environment ?? []}
                      onChange={updateEnvironment}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </DialogPanel>

        <DialogFooter className="sm:justify-between">
          <div className="flex min-w-0 items-center gap-1">
            {resetAction}
            {onDelete ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-muted-foreground hover:text-destructive"
                      onClick={onDelete}
                    >
                      <Trash2Icon className="size-3.5" />
                      Remove
                    </Button>
                  }
                />
                <TooltipPopup side="top">Delete this instance</TooltipPopup>
              </Tooltip>
            ) : null}
          </div>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function FallbackHeaderIcon(props: { readonly icon: Icon; readonly dotClassName: string }) {
  return (
    <span className="relative inline-flex size-9 items-center justify-center">
      <props.icon className="size-5 text-foreground/80" aria-hidden />
      <span
        className={cn(
          "pointer-events-none absolute -left-0.5 -top-0.5 size-2.5 rounded-full ring-2 ring-card",
          props.dotClassName,
        )}
        aria-hidden
      />
    </span>
  );
}
