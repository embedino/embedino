import { useAtomValue } from "@effect/atom-react";
import { connectionStatusText } from "@embedino/client-runtime/connection";
import { safeErrorLogAttributes } from "@embedino/client-runtime/errors";
import {
  isAtomCommandInterrupted,
  squashAtomCommandFailure,
} from "@embedino/client-runtime/state/runtime";
import {
  defaultInstanceIdForDriver,
  type EnvironmentId,
  PROVIDER_DISPLAY_NAMES,
  ProviderDriverKind,
  type ProviderInstanceConfig,
  type ProviderInstanceId,
} from "@embedino/contracts";
import { DEFAULT_UNIFIED_SETTINGS } from "@embedino/contracts/settings";
import * as Arr from "effect/Array";
import * as Equal from "effect/Equal";
import * as Result from "effect/Result";
import {
  CloudIcon,
  LaptopIcon,
  LoaderIcon,
  MonitorIcon,
  PlusIcon,
  RefreshCwIcon,
  TerminalIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isDesktopLocalConnectionTarget } from "../../connection/desktopLocal";
import { isElectron } from "../../env";
import { usePrimarySessionState } from "../../environments/primary";
import { useEnvironmentSettings, useUpdateEnvironmentSettings } from "../../hooks/useSettings";
import { resolveAppModelSelectionState } from "../../modelSelection";
import {
  useEnvironments,
  usePrimaryEnvironmentId,
  type EnvironmentPresentation,
} from "../../state/environments";
import { EMPTY_SERVER_PROVIDERS, serverEnvironment } from "../../state/server";
import { useEnvironmentSessionState } from "../../state/session";
import { useAtomCommand } from "../../state/use-atom-command";
import { getRelativeTimeState } from "../../timestampFormat";
import {
  ConnectionStatusDot,
  connectionPhaseDotClassName,
  connectionPhasePingClassName,
} from "../ConnectionStatusDot";
import {
  canOneClickUpdateProviderCandidate,
  collectProviderUpdateCandidates,
  hasOneClickUpdateProviderCandidate,
  isProviderUpdateActive,
  type ProviderUpdateCandidate,
} from "../ProviderUpdateLaunchNotification.logic";
import { Button } from "../ui/button";
import { stackedThreadToast, toastManager } from "../ui/toast";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "../ui/select";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { AddProviderInstanceDialog } from "./AddProviderInstanceDialog";
import { FavoriteModelsSection } from "./FavoriteModelsSection";
import {
  deriveProviderModelsForDisplay,
  ProviderInstanceCard,
  readConfigStringArray,
} from "./ProviderInstanceCard";
import { ProviderInstanceSettingsDialog } from "./ProviderInstanceSettingsDialog";
import { FEATURED_MODEL_LIMIT, selectFeaturedModelSlugs } from "./providerFeaturedModels";
import { DRIVER_OPTIONS, getDriverOption } from "./providerDriverMeta";
import { searchableSetting } from "./settingsSearch";
import { buildProviderInstanceUpdatePatch } from "./SettingsPanels.logic";
import {
  SettingResetButton,
  SettingsPageContainer,
  SettingsRow,
  SettingsSection,
  useRelativeTimeTick,
} from "./settingsLayout";
import {
  buildProviderEnvironmentOptions,
  classifyProviderEnvironmentAccess,
  type ProviderEnvironmentAccess,
  type ProviderOperateAccess,
  resolvePrimaryOperateAccess,
  resolveRemoteOperateAccess,
  resolveSelectedProviderEnvironmentId,
} from "./ProviderSettingsPanel.logic";

function withoutProviderInstanceKey<V>(
  record: Readonly<Record<ProviderInstanceId, V>> | undefined,
  key: ProviderInstanceId,
): Record<ProviderInstanceId, V> {
  const next = { ...record } as Record<ProviderInstanceId, V>;
  delete next[key];
  return next;
}

function withoutProviderInstanceFavorites(
  favorites: ReadonlyArray<{ readonly provider: ProviderInstanceId; readonly model: string }>,
  instanceId: ProviderInstanceId,
) {
  return favorites.filter((favorite) => favorite.provider !== instanceId);
}

const PROVIDER_SETTINGS = DRIVER_OPTIONS.map((definition) => ({
  provider: definition.value,
}));

function ProviderLastChecked({ lastCheckedAt }: { lastCheckedAt: string | null }) {
  useRelativeTimeTick();
  const lastCheckedRelative = getRelativeTimeState(lastCheckedAt);

  if (lastCheckedRelative.status === "missing") {
    return null;
  }

  if (lastCheckedRelative.status === "invalid") {
    return <span className="text-[11px] text-muted-foreground/50">Checked unavailable</span>;
  }

  return (
    <span className="text-[11px] text-muted-foreground/60">
      {lastCheckedRelative.suffix ? (
        <>
          Checked <span className="font-mono tabular-nums">{lastCheckedRelative.value}</span>{" "}
          {lastCheckedRelative.suffix}
        </>
      ) : (
        <>Checked {lastCheckedRelative.value}</>
      )}
    </span>
  );
}

function providerEnvironmentIcon(environment: EnvironmentPresentation) {
  if (environment.entry.target._tag === "PrimaryConnectionTarget") return MonitorIcon;
  if (environment.entry.target._tag === "RelayConnectionTarget") return CloudIcon;
  if (environment.entry.target._tag === "SshConnectionTarget") return TerminalIcon;
  if (isDesktopLocalConnectionTarget(environment.entry.target)) return LaptopIcon;
  return CloudIcon;
}

function providerEnvironmentDetail(environment: EnvironmentPresentation): string {
  if (environment.entry.target._tag === "PrimaryConnectionTarget") return "Primary device";
  if (environment.relayManaged) return "Embedino Connect";
  if (environment.entry.target._tag === "SshConnectionTarget") return "SSH";
  if (isDesktopLocalConnectionTarget(environment.entry.target)) return "Local device";
  return environment.displayUrl ?? "Remote device";
}

function EnvironmentUnavailableRow({
  environment,
  access,
}: {
  readonly environment: EnvironmentPresentation;
  readonly access: Exclude<ProviderEnvironmentAccess, { kind: "editable" | "read-only" }>;
}) {
  const isLoading = access.kind === "loading";
  const title = isLoading
    ? "Loading provider settings"
    : access.kind === "error"
      ? "Could not connect to this device"
      : "Provider settings are unavailable";
  const description = isLoading
    ? access.reason === "permissions"
      ? "Checking what this session is allowed to change."
      : `Waiting for ${environment.label}'s configuration.`
    : connectionStatusText(environment.connection);
  // No spinner: this state can persist indefinitely for a wedged device, and a
  // continuously repainting animation would run the whole time.
  return (
    <SettingsSection title="Providers">
      <SettingsRow title={title} description={description} />
    </SettingsSection>
  );
}

export function ProviderSettingsPanel() {
  const { environments, isReady } = useEnvironments();
  const primaryEnvironmentId = usePrimaryEnvironmentId();
  const options = useMemo(
    () => buildProviderEnvironmentOptions(environments, primaryEnvironmentId),
    [environments, primaryEnvironmentId],
  );
  // Raw user intent; the effective selection is re-derived every render so a
  // device that drops out of the catalog falls back without erasing the pick —
  // if it reappears (e.g. after a reconnect) the selection is restored.
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<EnvironmentId | null>(
    primaryEnvironmentId,
  );
  const effectiveEnvironmentId = resolveSelectedProviderEnvironmentId(
    options,
    selectedEnvironmentId,
    primaryEnvironmentId,
  );
  const selectedEnvironment =
    options.find((environment) => environment.environmentId === effectiveEnvironmentId) ?? null;
  const onlyPrimaryDevice =
    options.length === 1 && options[0]?.entry.target._tag === "PrimaryConnectionTarget";

  return (
    <SettingsPageContainer>
      {!onlyPrimaryDevice ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2 sm:px-4">
          {options.length === 0 ? (
            // The catalog hydrates asynchronously, so an empty list before it is
            // ready means "not loaded yet", not "nothing is connected".
            <span className="min-w-0 truncate text-[13px] text-muted-foreground">
              {isReady
                ? "No connected devices — connect an execution environment before configuring providers."
                : "Reading connected execution environments."}
            </span>
          ) : options.length === 1 ? (
            <SingleDeviceSummary environment={options[0]!} />
          ) : (
            <>
              <DeviceEnvironmentSelect
                options={options}
                value={effectiveEnvironmentId}
                selected={selectedEnvironment}
                onValueChange={setSelectedEnvironmentId}
              />
              {selectedEnvironment ? (
                <ConnectionStatusDot
                  tooltipText={connectionStatusText(selectedEnvironment.connection)}
                  dotClassName={connectionPhaseDotClassName(selectedEnvironment.connection.phase)}
                  pingClassName={connectionPhasePingClassName(selectedEnvironment.connection.phase)}
                />
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {selectedEnvironment ? (
        <SelectedEnvironmentProviderSettings
          key={selectedEnvironment.environmentId}
          environment={selectedEnvironment}
        />
      ) : null}
    </SettingsPageContainer>
  );
}

function SingleDeviceSummary({ environment }: { readonly environment: EnvironmentPresentation }) {
  const Icon = providerEnvironmentIcon(environment);
  const statusText = connectionStatusText(environment.connection);
  return (
    <span className="flex min-w-0 items-center gap-2 text-[13px]">
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="truncate font-medium text-foreground">{environment.label}</span>
      <ConnectionStatusDot
        tooltipText={statusText}
        dotClassName={connectionPhaseDotClassName(environment.connection.phase)}
        pingClassName={connectionPhasePingClassName(environment.connection.phase)}
      />
      <span className="min-w-0 truncate text-xs text-muted-foreground">
        {providerEnvironmentDetail(environment)} · {statusText}
      </span>
    </span>
  );
}

function DeviceEnvironmentSelect({
  options,
  value,
  selected,
  onValueChange,
}: {
  readonly options: ReadonlyArray<EnvironmentPresentation>;
  readonly value: EnvironmentId | null;
  readonly selected: EnvironmentPresentation | null;
  readonly onValueChange: (environmentId: EnvironmentId | null) => void;
}) {
  const SelectedIcon = selected ? providerEnvironmentIcon(selected) : null;
  return (
    <label className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Device
      </span>
      <Select
        value={value ?? ""}
        onValueChange={(next) => {
          if (!isEnvironmentIdValue(next)) return;
          onValueChange(next);
        }}
      >
        <SelectTrigger
          className="h-8 w-auto max-w-56 gap-1.5 bg-background px-2.5"
          aria-label="Target device"
        >
          <SelectValue>
            <span className="flex min-w-0 items-center gap-1.5">
              {SelectedIcon ? (
                <SelectedIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              ) : null}
              <span className="truncate text-[13px] font-medium">
                {selected?.label ?? "Select device"}
              </span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectPopup align="start" alignItemWithTrigger={false}>
          {options.map((environment) => {
            const Icon = providerEnvironmentIcon(environment);
            return (
              <SelectItem key={environment.environmentId} value={environment.environmentId}>
                <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 truncate">{environment.label}</span>
                <span className="ml-auto shrink-0 pl-2 text-[10px] text-muted-foreground/70">
                  {providerEnvironmentDetail(environment)}
                </span>
              </SelectItem>
            );
          })}
        </SelectPopup>
      </Select>
    </label>
  );
}

function isEnvironmentIdValue(value: string | null): value is EnvironmentId {
  return typeof value === "string" && value.length > 0;
}

function SelectedEnvironmentProviderSettings({
  environment,
}: {
  readonly environment: EnvironmentPresentation;
}) {
  const isPrimary = environment.entry.target._tag === "PrimaryConnectionTarget";
  if (isPrimary) {
    // The desktop app owns its primary server outright; a browser session
    // checks the scopes its cookie session was granted.
    if (isElectron) {
      return <AccessGatedProviderSettings environment={environment} operateAccess="granted" />;
    }
    return <PrimarySessionGatedProviderSettings environment={environment} />;
  }
  return <RemoteSessionGatedProviderSettings environment={environment} />;
}

function PrimarySessionGatedProviderSettings({
  environment,
}: {
  readonly environment: EnvironmentPresentation;
}) {
  const primarySessionState = usePrimarySessionState();
  const operateAccess = resolvePrimaryOperateAccess({
    isPrimary: true,
    hasDesktopBridge: false,
    session: primarySessionState.data,
    isPending: primarySessionState.isPending,
    hasError: primarySessionState.error !== null,
  });
  return <AccessGatedProviderSettings environment={environment} operateAccess={operateAccess} />;
}

function RemoteSessionGatedProviderSettings({
  environment,
}: {
  readonly environment: EnvironmentPresentation;
}) {
  const sessionState = useEnvironmentSessionState(environment.environmentId);
  const operateAccess = resolveRemoteOperateAccess({
    session: sessionState.data,
    isPending: sessionState.isPending,
    hasError: sessionState.hasError,
  });
  return <AccessGatedProviderSettings environment={environment} operateAccess={operateAccess} />;
}

function AccessGatedProviderSettings({
  environment,
  operateAccess,
}: {
  readonly environment: EnvironmentPresentation;
  readonly operateAccess: ProviderOperateAccess;
}) {
  const access = classifyProviderEnvironmentAccess({
    connectionPhase: environment.connection.phase,
    hasServerConfig: environment.serverConfig !== null,
    operateAccess,
  });
  if (access.kind !== "editable" && access.kind !== "read-only") {
    return <EnvironmentUnavailableRow environment={environment} access={access} />;
  }
  return (
    <EnvironmentProviderSettings
      environmentId={environment.environmentId}
      environmentLabel={environment.label}
      readOnly={access.kind === "read-only"}
    />
  );
}

export function EnvironmentProviderSettings({
  environmentId,
  environmentLabel,
  readOnly = false,
}: {
  readonly environmentId: EnvironmentId;
  readonly environmentLabel: string;
  /**
   * Render the full provider layout, greyed out and inert, when this session's
   * credential lacks `orchestration:operate` on the environment. Showing the
   * real configuration keeps the view honest; disabling interaction keeps
   * every one of its writes from being offered and then rejected.
   */
  readonly readOnly?: boolean;
}) {
  const settings = useEnvironmentSettings(environmentId);
  const updateSettings = useUpdateEnvironmentSettings(environmentId);
  const serverProviders =
    useAtomValue(serverEnvironment.providersValueAtom(environmentId)) ?? EMPTY_SERVER_PROVIDERS;
  const refreshServerProviders = useAtomCommand(serverEnvironment.refreshProviders, {
    reportFailure: false,
  });
  const updateProvider = useAtomCommand(serverEnvironment.updateProvider, {
    reportFailure: false,
  });
  const [isRefreshingProviders, setIsRefreshingProviders] = useState(false);
  const [isAddInstanceDialogOpen, setIsAddInstanceDialogOpen] = useState(false);
  const [activeInstanceId, setActiveInstanceId] = useState<ProviderInstanceId | null>(null);
  const [updatingProviderDrivers, setUpdatingProviderDrivers] = useState<
    ReadonlySet<ProviderDriverKind>
  >(() => new Set());
  const refreshingRef = useRef(false);
  const updatingDriversRef = useRef<Set<ProviderDriverKind>>(new Set());

  const providerUpdateCandidates = useMemo(
    () => collectProviderUpdateCandidates(serverProviders),
    [serverProviders],
  );
  const providerUpdateCandidateByInstanceId = useMemo(
    () => new Map(providerUpdateCandidates.map((candidate) => [candidate.instanceId, candidate])),
    [providerUpdateCandidates],
  );
  const visibleProviderSettings = PROVIDER_SETTINGS.filter(
    (providerSettings) =>
      providerSettings.provider !== "cursor" ||
      serverProviders.some(
        (provider) =>
          provider.instanceId === defaultInstanceIdForDriver(ProviderDriverKind.make("cursor")),
      ),
  );
  const textGenerationModelSelection = resolveAppModelSelectionState(settings, serverProviders);
  const textGenInstanceId = textGenerationModelSelection.instanceId;
  const lastCheckedAt =
    serverProviders.length > 0
      ? serverProviders.reduce(
          (latest, provider) => (provider.checkedAt > latest ? provider.checkedAt : latest),
          serverProviders[0]!.checkedAt,
        )
      : null;

  const refreshProviders = useCallback(() => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setIsRefreshingProviders(true);
    void (async () => {
      const result = await refreshServerProviders({
        environmentId,
        input: {},
      });
      refreshingRef.current = false;
      setIsRefreshingProviders(false);
      if (result._tag === "Failure" && !isAtomCommandInterrupted(result)) {
        console.warn("Failed to refresh providers", {
          operation: "refresh-providers",
          environmentId,
          ...safeErrorLogAttributes(squashAtomCommandFailure(result)),
        });
      }
    })();
  }, [environmentId, refreshServerProviders]);

  const runProviderUpdate = useCallback(
    async (candidate: ProviderUpdateCandidate) => {
      // Ref-based re-entry guard, mirroring refreshProviders: a state updater
      // may run after this function returns, so it cannot gate the dispatch.
      if (updatingDriversRef.current.has(candidate.driver)) {
        return;
      }
      updatingDriversRef.current.add(candidate.driver);
      setUpdatingProviderDrivers((previous) => new Set(previous).add(candidate.driver));

      const result = await updateProvider({
        environmentId,
        input: {
          provider: candidate.driver,
          instanceId: candidate.instanceId,
        },
      });
      if (result._tag === "Failure" && !isAtomCommandInterrupted(result)) {
        const error = squashAtomCommandFailure(result);
        toastManager.add(
          stackedThreadToast({
            type: "error",
            title: `Could not update ${PROVIDER_DISPLAY_NAMES[candidate.driver] ?? candidate.driver}`,
            description:
              error instanceof Error
                ? error.message
                : "The provider update command could not be started.",
          }),
        );
      }
      updatingDriversRef.current.delete(candidate.driver);
      setUpdatingProviderDrivers((previous) => {
        if (!previous.has(candidate.driver)) {
          return previous;
        }
        const next = new Set(previous);
        next.delete(candidate.driver);
        return next;
      });
    },
    [environmentId, updateProvider],
  );

  interface InstanceRow {
    readonly instanceId: ProviderInstanceId;
    readonly instance: ProviderInstanceConfig;
    readonly driver: ProviderDriverKind;
    readonly isDefault: boolean;
    readonly isDirty?: boolean;
  }

  const instancesByDriver = new Map<
    ProviderDriverKind,
    Array<[ProviderInstanceId, ProviderInstanceConfig]>
  >();
  for (const [rawId, instance] of Object.entries(settings.providerInstances ?? {})) {
    const driver = instance.driver;
    const list = instancesByDriver.get(driver) ?? [];
    list.push([rawId as ProviderInstanceId, instance]);
    instancesByDriver.set(driver, list);
  }

  const defaultSlotIdsBySource = new Set<string>(
    visibleProviderSettings.map((providerSettings) =>
      String(defaultInstanceIdForDriver(providerSettings.provider)),
    ),
  );

  const rows: InstanceRow[] = [];
  const visibleDriverKinds = new Set<ProviderDriverKind>(
    visibleProviderSettings.map((providerSettings) => providerSettings.provider),
  );

  for (const providerSettings of visibleProviderSettings) {
    type LegacyProviderSettings = (typeof settings.providers)[keyof typeof settings.providers];
    const legacyProviders = settings.providers as Record<string, LegacyProviderSettings>;
    const defaultLegacyProviders = DEFAULT_UNIFIED_SETTINGS.providers as Record<
      string,
      LegacyProviderSettings
    >;
    const driver = providerSettings.provider;
    const defaultInstanceId = defaultInstanceIdForDriver(driver);
    const explicitInstance = settings.providerInstances?.[defaultInstanceId];
    // A remote device may run a server version whose settings predate this
    // driver, so the legacy mirror can be absent. Without either an explicit
    // instance or a legacy blob there is nothing to render for the slot.
    const legacyConfig = legacyProviders[providerSettings.provider];
    const defaultLegacyConfig = defaultLegacyProviders[providerSettings.provider];
    const effectiveInstance: ProviderInstanceConfig | undefined =
      explicitInstance ??
      (legacyConfig !== undefined
        ? ({
            driver,
            enabled: legacyConfig.enabled,
            config: legacyConfig,
          } satisfies ProviderInstanceConfig)
        : undefined);
    // Only the default slot depends on the legacy blob; custom instances for
    // the driver must still render even when the slot has nothing to show.
    if (effectiveInstance !== undefined) {
      const isDirty =
        explicitInstance !== undefined || !Equal.equals(legacyConfig, defaultLegacyConfig);
      rows.push({
        instanceId: defaultInstanceId,
        instance: effectiveInstance,
        driver,
        isDefault: true,
        isDirty,
      });
    }
    for (const [id, instance] of instancesByDriver.get(providerSettings.provider) ?? []) {
      if (id === defaultInstanceId) continue;
      rows.push({ instanceId: id, instance, driver: instance.driver, isDefault: false });
    }
  }
  for (const [driver, list] of instancesByDriver) {
    if (visibleDriverKinds.has(driver)) continue;
    for (const [id, instance] of list) {
      rows.push({
        instanceId: id,
        instance,
        driver: instance.driver,
        isDefault: defaultSlotIdsBySource.has(String(id)),
      });
    }
  }

  const updateProviderInstance = (
    row: InstanceRow,
    next: ProviderInstanceConfig,
    options?: {
      readonly textGenerationModelSelection?: Parameters<
        typeof buildProviderInstanceUpdatePatch
      >[0]["textGenerationModelSelection"];
    },
  ) => {
    updateSettings(
      buildProviderInstanceUpdatePatch({
        settings,
        instanceId: row.instanceId,
        instance: next,
        driver: row.driver,
        isDefault: row.isDefault,
        textGenerationModelSelection: options?.textGenerationModelSelection,
      }),
    );
  };

  const deleteProviderInstance = (id: ProviderInstanceId) => {
    updateSettings({
      providerInstances: withoutProviderInstanceKey(settings.providerInstances, id),
    });
  };

  const updateProviderModelPreferences = (
    instanceId: ProviderInstanceId,
    next: {
      readonly hiddenModels: ReadonlyArray<string>;
      readonly modelOrder: ReadonlyArray<string>;
    },
  ) => {
    const hiddenModels = [...new Set(next.hiddenModels.filter((slug) => slug.trim().length > 0))];
    const modelOrder = [...new Set(next.modelOrder.filter((slug) => slug.trim().length > 0))];
    const rest = withoutProviderInstanceKey(settings.providerModelPreferences, instanceId);
    updateSettings({
      providerModelPreferences:
        hiddenModels.length === 0 && modelOrder.length === 0
          ? rest
          : {
              ...rest,
              [instanceId]: {
                hiddenModels,
                modelOrder,
              },
            },
    });
  };

  const updateProviderFavoriteModels = (
    instanceId: ProviderInstanceId,
    nextFavoriteModels: ReadonlyArray<string>,
  ) => {
    const favoriteModels = [
      ...new Set(
        Arr.filterMap(nextFavoriteModels, (slug) => {
          const trimmedSlug = slug.trim();
          return trimmedSlug.length > 0 ? Result.succeed(trimmedSlug) : Result.failVoid;
        }),
      ),
    ];
    updateSettings({
      favorites: [
        ...withoutProviderInstanceFavorites(settings.favorites ?? [], instanceId),
        ...favoriteModels.map((model) => ({ provider: instanceId, model })),
      ],
    });
  };

  const resetDefaultInstance = (driverKind: ProviderDriverKind) => {
    type LegacyProviderSettings = (typeof settings.providers)[keyof typeof settings.providers];
    const defaultLegacyProviders = DEFAULT_UNIFIED_SETTINGS.providers as Record<
      string,
      LegacyProviderSettings | undefined
    >;
    const defaultInstanceId = defaultInstanceIdForDriver(driverKind);
    const defaultLegacyProvider = defaultLegacyProviders[driverKind];
    if (defaultLegacyProvider === undefined) return;
    updateSettings({
      providers: {
        ...settings.providers,
        [driverKind]: defaultLegacyProvider,
      } as typeof settings.providers,
      providerInstances: withoutProviderInstanceKey(settings.providerInstances, defaultInstanceId),
    });
  };

  // Shared per-row derived values for both the quiet list row and the
  // settings dialog, so opening a dialog never re-derives with drift.
  const resolveRowRuntime = (row: InstanceRow) => {
    const driverOption = getDriverOption(row.driver);
    const liveProvider = serverProviders.find(
      (candidate) => candidate.instanceId === row.instanceId,
    );
    const updateCandidate = liveProvider
      ? providerUpdateCandidateByInstanceId.get(liveProvider.instanceId)
      : undefined;
    const isDriverUpdateRunning =
      updateCandidate !== undefined &&
      (updatingProviderDrivers.has(updateCandidate.driver) ||
        serverProviders.some(
          (provider) =>
            provider.driver === updateCandidate.driver && isProviderUpdateActive(provider),
        ));
    const showInlineUpdateButton =
      updateCandidate !== undefined &&
      hasOneClickUpdateProviderCandidate(updateCandidate, serverProviders);
    const canRunInlineUpdate =
      updateCandidate !== undefined &&
      canOneClickUpdateProviderCandidate(updateCandidate, serverProviders) &&
      !updatingProviderDrivers.has(updateCandidate.driver);
    const modelPreferences = settings.providerModelPreferences?.[row.instanceId] ?? {
      hiddenModels: [],
      modelOrder: [],
    };
    const favoriteModels = Arr.filterMap(settings.favorites ?? [], (favorite) =>
      favorite.provider === row.instanceId ? Result.succeed(favorite.model) : Result.failVoid,
    );
    const resetLabel = driverOption?.label ?? String(row.driver);
    const resetAction =
      row.isDefault && row.isDirty ? (
        <SettingResetButton
          label={`${resetLabel} provider settings`}
          onClick={() => resetDefaultInstance(row.driver)}
        />
      ) : null;
    return {
      driverOption,
      liveProvider,
      updateCandidate,
      isDriverUpdateRunning,
      showInlineUpdateButton,
      canRunInlineUpdate,
      modelPreferences,
      favoriteModels,
      resetAction,
    };
  };

  // First sight of a provider's model list: seed the model preferences so
  // only the curated flagship models start enabled. Everything else stays
  // available behind "View all models" — one switch flips any of them back
  // on. The seed runs once per instance because its presence in
  // `providerModelPreferences` is itself the completion marker, so user
  // edits are never overwritten.
  useEffect(() => {
    if (readOnly) return;
    const seeds = new Map<ProviderInstanceId, ReadonlyArray<string>>();
    for (const row of rows) {
      if (settings.providerModelPreferences?.[row.instanceId] !== undefined) continue;
      const liveModels = serverProviders.find(
        (candidate) => candidate.instanceId === row.instanceId,
      )?.models;
      const models = deriveProviderModelsForDisplay({
        liveModels,
        customModels: readConfigStringArray(row.instance.config, "customModels"),
      });
      if (models.length <= FEATURED_MODEL_LIMIT) continue;
      const featured = new Set(selectFeaturedModelSlugs(row.driver, models));
      const hiddenModels = models
        .filter((model) => !featured.has(model.slug))
        .map((model) => model.slug);
      if (hiddenModels.length === 0) continue;
      seeds.set(row.instanceId, hiddenModels);
    }
    if (seeds.size === 0) return;
    updateSettings({
      providerModelPreferences: {
        ...settings.providerModelPreferences,
        ...Object.fromEntries(
          [...seeds].map(([instanceId, hiddenModels]) => [
            instanceId,
            { hiddenModels: [...hiddenModels], modelOrder: [] },
          ]),
        ),
      },
    });
  }, [readOnly, rows, serverProviders, settings.providerModelPreferences, updateSettings]);

  return (
    <>
      <SettingsSection
        {...searchableSetting("providers")}
        headerAction={
          <div className="flex items-center gap-1">
            <ProviderLastChecked lastCheckedAt={lastCheckedAt} />
            {!readOnly ? (
              <>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="size-7 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                        onClick={() => setIsAddInstanceDialogOpen(true)}
                        aria-label="Add provider instance"
                      >
                        <PlusIcon className="size-3.5" />
                      </Button>
                    }
                  />
                  <TooltipPopup side="top">Add provider instance</TooltipPopup>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="size-7 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                        disabled={isRefreshingProviders}
                        onClick={() => void refreshProviders()}
                        aria-label="Refresh provider status"
                      >
                        {isRefreshingProviders ? (
                          <LoaderIcon className="size-3.5 animate-spin" />
                        ) : (
                          <RefreshCwIcon className="size-3.5" />
                        )}
                      </Button>
                    }
                  />
                  <TooltipPopup side="top">Refresh provider status</TooltipPopup>
                </Tooltip>
              </>
            ) : null}
          </div>
        }
      >
        {readOnly ? (
          <SettingsRow
            title="Limited permissions"
            description={`This session can view ${environmentLabel}'s providers, but its credential does not allow changing their configuration.`}
          />
        ) : null}
        <div
          // `inert` blocks focus and interaction in one attribute, so the
          // read-only view stays byte-for-byte the editable layout without
          // threading a disabled flag through every control.
          inert={readOnly}
          aria-disabled={readOnly || undefined}
          className={
            readOnly
              ? "overflow-hidden rounded-xl border border-border/60 opacity-50 select-none"
              : "overflow-hidden rounded-xl border border-border/60"
          }
        >
          <div className="divide-y divide-border/40">
            {rows.map((row) => {
              const runtime = resolveRowRuntime(row);
              return (
                <ProviderInstanceCard
                  key={row.instanceId}
                  instanceId={row.instanceId}
                  instance={row.instance}
                  driverOption={runtime.driverOption}
                  liveProvider={runtime.liveProvider}
                  onOpenSettings={() => setActiveInstanceId(row.instanceId)}
                  onUpdate={(next) => {
                    const wasEnabled = row.instance.enabled ?? true;
                    const isDisabling = next.enabled === false && wasEnabled;
                    const shouldClearTextGen = isDisabling && textGenInstanceId === row.instanceId;
                    if (shouldClearTextGen) {
                      updateProviderInstance(row, next, {
                        textGenerationModelSelection:
                          DEFAULT_UNIFIED_SETTINGS.textGenerationModelSelection,
                      });
                    } else {
                      updateProviderInstance(row, next);
                    }
                  }}
                  onDelete={
                    row.isDefault ? undefined : () => deleteProviderInstance(row.instanceId)
                  }
                  headerAction={runtime.resetAction}
                />
              );
            })}
          </div>
        </div>
        <div className="mt-3">
          <FavoriteModelsSection
            serverProviders={serverProviders}
            settings={settings}
            readOnly={readOnly}
          />
        </div>
      </SettingsSection>

      {(() => {
        const activeRow = activeInstanceId
          ? rows.find((row) => row.instanceId === activeInstanceId)
          : null;
        if (!activeRow) return null;
        const runtime = resolveRowRuntime(activeRow);
        const { showInlineUpdateButton, updateCandidate, canRunInlineUpdate } = runtime;
        return (
          <ProviderInstanceSettingsDialog
            key={activeRow.instanceId}
            open
            onOpenChange={(next) => {
              if (!next) setActiveInstanceId(null);
            }}
            instanceId={activeRow.instanceId}
            instance={activeRow.instance}
            driverOption={runtime.driverOption}
            liveProvider={runtime.liveProvider}
            onUpdate={(next) => {
              const wasEnabled = activeRow.instance.enabled ?? true;
              const isDisabling = next.enabled === false && wasEnabled;
              const shouldClearTextGen = isDisabling && textGenInstanceId === activeRow.instanceId;
              if (shouldClearTextGen) {
                updateProviderInstance(activeRow, next, {
                  textGenerationModelSelection:
                    DEFAULT_UNIFIED_SETTINGS.textGenerationModelSelection,
                });
              } else {
                updateProviderInstance(activeRow, next);
              }
            }}
            onDelete={
              activeRow.isDefault
                ? undefined
                : () => {
                    setActiveInstanceId(null);
                    deleteProviderInstance(activeRow.instanceId);
                  }
            }
            resetAction={runtime.resetAction}
            hiddenModels={runtime.modelPreferences.hiddenModels}
            favoriteModels={runtime.favoriteModels}
            modelOrder={runtime.modelPreferences.modelOrder}
            onHiddenModelsChange={(hiddenModels) =>
              updateProviderModelPreferences(activeRow.instanceId, {
                ...runtime.modelPreferences,
                hiddenModels,
              })
            }
            onFavoriteModelsChange={(favoriteModels) =>
              updateProviderFavoriteModels(activeRow.instanceId, favoriteModels)
            }
            onModelOrderChange={(modelOrder) =>
              updateProviderModelPreferences(activeRow.instanceId, {
                ...runtime.modelPreferences,
                modelOrder,
              })
            }
            onRunUpdate={
              showInlineUpdateButton && updateCandidate
                ? () => {
                    if (!canRunInlineUpdate) {
                      return;
                    }
                    void runProviderUpdate(updateCandidate);
                  }
                : undefined
            }
            isUpdating={runtime.showInlineUpdateButton ? runtime.isDriverUpdateRunning : undefined}
          />
        );
      })()}

      {isAddInstanceDialogOpen ? (
        <AddProviderInstanceDialog
          open
          environmentId={environmentId}
          environmentLabel={environmentLabel}
          onOpenChange={setIsAddInstanceDialogOpen}
        />
      ) : null}
    </>
  );
}
