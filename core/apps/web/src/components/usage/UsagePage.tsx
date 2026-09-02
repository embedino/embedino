import type { UsageProviderKind } from "@embedino/contracts";
import { CheckIcon, RefreshCwIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import type { DailyTotals, HourlyTotals } from "@embedino/shared/usageMerge";

import { isElectron } from "../../env";
import { cn } from "../../lib/utils";
import { useUsage, type EnvironmentUsageStatus } from "../../state/usage";
import {
  enumerateDays,
  enumerateHourStarts,
  formatCount,
  formatDateTimeShort,
  formatDayShort,
  formatHourShort,
  formatPercent,
  formatTokens,
  formatUsd,
  makeWindow,
} from "@embedino/shared/usageFormat";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarInset } from "../ui/sidebar";
import { WorkspaceBreadcrumb, WorkspaceBreadcrumbItem } from "../WorkspaceBreadcrumb";
import { COLLAPSED_SIDEBAR_TITLEBAR_INSET_CLASS } from "../../workspaceTitlebar";
import { UsageChartLegend, UsageProviderChart, type UsageChartMetric } from "./UsageProviderChart";
import { PROVIDER_COLOR, PROVIDER_LABEL, PROVIDER_MARK, PROVIDER_ORDER } from "./usageProviders";

const WINDOW_OPTIONS = [
  { days: 1, label: "Past 24h" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

export function UsagePage() {
  const [windowSelection, setWindowSelection] = useState(() => ({
    days: 30,
    window: makeWindow(30),
  }));
  const [metric, setMetric] = useState<UsageChartMetric>("tokens");
  const [breakdown, setBreakdown] = useState<"model" | "time">("model");
  const { days: windowDays, window } = windowSelection;
  const isPast24Hours = windowDays === 1;
  const { merged, environments, isPending, isPartial, refresh } = useUsage(window);

  // Hold the content until every environment is terminal. Rendering merged
  // totals while devices are still answering makes every number on the page
  // jump as each one lands.
  const settling = isPending || isPartial;

  const days = useMemo(
    () => enumerateDays(window.sinceDay, window.untilDay),
    [window.sinceDay, window.untilDay],
  );
  const hours = useMemo(
    () =>
      window.sinceTime === undefined || window.untilTime === undefined
        ? []
        : enumerateHourStarts(window.sinceTime, window.untilTime),
    [window.sinceTime, window.untilTime],
  );
  // Newest first: the window can run 90 periods, so the interesting end
  // belongs at the top of the table.
  const breakdownPeriods = useMemo<readonly (DailyTotals | HourlyTotals)[]>(
    () => (isPast24Hours ? merged.hourly : merged.daily).toReversed(),
    [isPast24Hours, merged.daily, merged.hourly],
  );

  // Ranked by whatever the toggle is showing, so the bars always descend.
  const orderedProviders = useMemo(
    () =>
      merged.providers.toSorted((a, b) =>
        metric === "cost" ? b.costUsd - a.costUsd : b.totalTokens - a.totalTokens,
      ),
    [merged.providers, metric],
  );

  const activePeriods = (isPast24Hours ? merged.hourly : merged.daily).filter(
    (period) => period.totalTokens > 0,
  ).length;
  const periodAverage = activePeriods === 0 ? 0 : merged.totalTokens / activePeriods;
  const observedInput = merged.uncachedInputTokens + merged.cachedInputTokens;
  const cachedShare = observedInput === 0 ? 0 : merged.cachedInputTokens / observedInput;
  const selectWindow = (days: number) => {
    setWindowSelection({
      days,
      window: makeWindow(days, undefined, days === 1 ? "hour" : "day"),
    });
  };
  const refreshWindow = () => {
    const nextWindow = makeWindow(windowDays, undefined, isPast24Hours ? "hour" : "day");
    if (
      nextWindow.sinceDay === window.sinceDay &&
      nextWindow.untilDay === window.untilDay &&
      nextWindow.sinceTime === window.sinceTime &&
      nextWindow.untilTime === window.untilTime
    ) {
      refresh();
    } else {
      setWindowSelection({ days: windowDays, window: nextWindow });
    }
  };

  return (
    <SidebarInset className="h-dvh min-h-0 overflow-hidden overscroll-y-none bg-background text-foreground isolate">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background text-foreground">
        {!isElectron && (
          <header
            className={cn(
              "workspace-topbar px-3 transition-[padding-left] duration-200 ease-linear motion-reduce:transition-none sm:px-5",
              COLLAPSED_SIDEBAR_TITLEBAR_INSET_CLASS,
            )}
          >
            <WorkspaceBreadcrumb ariaLabel="Usage breadcrumb">
              <WorkspaceBreadcrumbItem current>Usage</WorkspaceBreadcrumbItem>
            </WorkspaceBreadcrumb>
          </header>
        )}

        {isElectron && (
          <div
            className={cn(
              "drag-region flex h-[52px] shrink-0 items-center px-5 transition-[padding-left] duration-200 ease-linear motion-reduce:transition-none wco:h-[env(titlebar-area-height)] wco:pr-[calc(100vw-env(titlebar-area-width)-env(titlebar-area-x)+1em)]",
              COLLAPSED_SIDEBAR_TITLEBAR_INSET_CLASS,
            )}
          >
            <WorkspaceBreadcrumb ariaLabel="Usage breadcrumb">
              <WorkspaceBreadcrumbItem current>Usage</WorkspaceBreadcrumbItem>
            </WorkspaceBreadcrumb>
          </div>
        )}

        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
            <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {isPast24Hours && window.sinceTime !== undefined && window.untilTime !== undefined
                    ? `${formatDateTimeShort(window.sinceTime, window.timeZone)} to ${formatDateTimeShort(window.untilTime, window.timeZone)}`
                    : `${formatDayShort(window.sinceDay)} to ${formatDayShort(window.untilDay)}`}
                </span>
                <span>
                  {environments.length === 1
                    ? "1 environment"
                    : `${formatCount(environments.length)} environments`}
                </span>
                {!settling ? <span>{formatCount(merged.sessions)} sessions</span> : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-md border border-border">
                  {WINDOW_OPTIONS.map((option) => (
                    <button
                      key={option.days}
                      type="button"
                      aria-pressed={option.days === windowDays}
                      onClick={() => selectWindow(option.days)}
                      className={cn(
                        "relative cursor-pointer px-3 py-1.5 text-xs outline-none first:rounded-s-[calc(var(--radius-md)-1px)] last:rounded-e-[calc(var(--radius-md)-1px)] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring",
                        option.days === windowDays
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={refreshWindow}
                  aria-label="Refresh usage"
                  className="cursor-pointer rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCwIcon className="size-3.5" />
                </button>
              </div>
            </div>

            {settling ? (
              <>
                {environments.length > 1 ? <UsageDeviceStrip environments={environments} /> : null}
                <UsageSkeleton resolution={isPast24Hours ? "hour" : "day"} />
              </>
            ) : (
              <>
                <UsageCoverageNotice
                  environments={environments}
                  duplicateSources={merged.duplicateSources}
                  staleEnvironments={merged.staleEnvironments}
                />

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                  <div className="flex min-w-0 flex-col gap-5 rounded-xl border border-border bg-card/35 p-4 shadow-sm sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                          {metric === "cost" ? "Estimated cost" : "Processed tokens"}
                        </span>
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl">
                            {metric === "cost"
                              ? formatUsd(merged.costUsd)
                              : formatTokens(merged.totalTokens)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {metric === "cost"
                              ? "at full API rates"
                              : `${formatTokens(periodAverage)} per active ${isPast24Hours ? "hour" : "day"}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex rounded-lg border border-border bg-background p-0.5">
                        {(["tokens", "cost"] as const).map((option) => (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={option === metric}
                            onClick={() => setMetric(option)}
                            className={cn(
                              "cursor-pointer rounded-md px-3 py-1.5 text-[10px] font-medium tracking-wide uppercase transition-colors",
                              option === metric
                                ? "bg-muted text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4">
                      <h2 className="text-sm font-medium text-foreground">
                        {isPast24Hours ? "Hourly" : "Daily"} usage
                      </h2>
                      <UsageChartLegend />
                    </div>
                    <UsageProviderChart
                      days={days}
                      daily={merged.daily}
                      hours={hours}
                      hourly={merged.hourly}
                      metric={metric}
                      referenceTime={window.untilTime}
                      resolution={isPast24Hours ? "hour" : "day"}
                      timeZone={window.timeZone}
                    />
                  </div>

                  <aside className="flex flex-col rounded-xl border border-border bg-card/35 p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                          Providers
                        </span>
                        <h2 className="mt-1 text-sm font-medium text-foreground">
                          Usage distribution
                        </h2>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground tabular-nums">
                        {orderedProviders.length} active
                      </span>
                    </div>
                    <div className="mt-4 flex flex-1 flex-col gap-3">
                      {orderedProviders.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
                          No provider activity in this window.
                        </div>
                      ) : null}
                      {orderedProviders.map((provider) => {
                        const share = metric === "cost" ? provider.costShare : provider.tokenShare;
                        return (
                          <div
                            key={provider.provider}
                            className="flex flex-col gap-3 rounded-lg border border-border bg-background/50 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-2 text-sm text-foreground">
                                <span className="flex size-7 items-center justify-center rounded-md border border-border bg-background">
                                  <ProviderMark provider={provider.provider} className="size-3.5" />
                                </span>
                                {PROVIDER_LABEL[provider.provider]}
                              </span>
                              <span className="text-xs font-medium text-foreground tabular-nums">
                                {formatPercent(share)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(share * 100).toFixed(1)}%`,
                                  backgroundColor: PROVIDER_COLOR[provider.provider],
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <ProviderMetric
                                label="Tokens"
                                value={formatTokens(provider.totalTokens)}
                              />
                              <ProviderMetric label="Cost" value={formatUsd(provider.costUsd)} />
                              <ProviderMetric
                                label="Records"
                                value={formatCount(provider.records)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </aside>
                </section>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Metric
                    label="Processed tokens"
                    value={formatTokens(merged.totalTokens)}
                    detail={`${formatTokens(periodAverage)} per active ${isPast24Hours ? "hour" : "day"}`}
                  />
                  <Metric
                    label="Cached input"
                    value={formatTokens(merged.cachedInputTokens)}
                    detail={`${formatPercent(cachedShare)} of observed input`}
                  />
                  <Metric
                    label="Uncached input"
                    value={formatTokens(merged.uncachedInputTokens)}
                    detail={`${formatTokens(merged.cacheCreationTokens)} cache writes`}
                  />
                  <Metric
                    label="Output"
                    value={formatTokens(merged.outputTokens)}
                    detail={`includes ${formatTokens(merged.reasoningTokens)} reasoning`}
                  />
                  <Metric
                    label="Cache savings"
                    value={formatUsd(merged.costQuality.cacheSavingsUsd)}
                    detail={
                      merged.costUsd > 0
                        ? `${(merged.costQuality.cacheSavingsUsd / merged.costUsd).toFixed(1)}x the raw token cost`
                        : "vs full input rates"
                    }
                  />
                </section>

                <section className="flex flex-col gap-4 rounded-xl border border-border bg-card/35 p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
                    <div>
                      <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                        Activity ledger
                      </span>
                      <h2 className="mt-1 text-sm font-medium text-foreground">Usage breakdown</h2>
                    </div>
                    <div className="flex overflow-hidden rounded-md border border-border">
                      {(
                        [
                          { value: "model", label: "model" },
                          { value: "time", label: isPast24Hours ? "hour" : "day" },
                        ] as const
                      ).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setBreakdown(option.value)}
                          className={cn(
                            "cursor-pointer px-2.5 py-1 text-[10px] tracking-wide uppercase",
                            option.value === breakdown
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {breakdown === "model" ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="py-2 font-normal">Model</th>
                          <th className="py-2 text-right font-normal">Cost</th>
                          <th className="py-2 text-right font-normal">Share</th>
                          <th className="py-2 text-right font-normal">Tokens</th>
                        </tr>
                      </thead>
                      <tbody>
                        {merged.models.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-muted-foreground">
                              No activity in this window.
                            </td>
                          </tr>
                        ) : (
                          merged.models.map((model) => (
                            <tr
                              key={`${model.provider}:${model.model}`}
                              className="border-b border-border/50"
                            >
                              <td className="py-2 text-foreground">
                                <span className="flex items-center gap-2">
                                  <ProviderMark provider={model.provider} className="size-3.5" />
                                  {model.model}
                                </span>
                              </td>
                              <td className="py-2 text-right text-foreground tabular-nums">
                                {formatUsd(model.costUsd)}
                              </td>
                              <td className="py-2 text-right text-muted-foreground tabular-nums">
                                {formatPercent(model.costShare)}
                              </td>
                              <td className="py-2 text-right text-muted-foreground tabular-nums">
                                {formatTokens(model.totalTokens)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="py-2 font-normal">{isPast24Hours ? "Hour" : "Day"}</th>
                          {PROVIDER_ORDER.map((provider) => (
                            <th key={provider} className="py-2 text-right font-normal">
                              {PROVIDER_LABEL[provider]}
                            </th>
                          ))}
                          <th className="py-2 text-right font-normal">Total</th>
                          <th className="py-2 text-right font-normal">Tokens</th>
                        </tr>
                      </thead>
                      <tbody>
                        {breakdownPeriods.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-muted-foreground">
                              No activity in this window.
                            </td>
                          </tr>
                        ) : (
                          breakdownPeriods.map((period) => (
                            <tr
                              key={"hourStart" in period ? period.hourStart : period.day}
                              className="border-b border-border/50"
                            >
                              <td className="py-2 text-foreground">
                                {"hourStart" in period
                                  ? formatHourShort(period.hourStart, window.timeZone)
                                  : formatDayShort(period.day)}
                              </td>
                              {PROVIDER_ORDER.map((provider) => (
                                <td
                                  key={provider}
                                  className="py-2 text-right text-muted-foreground tabular-nums"
                                >
                                  {formatUsd(period.byProvider.get(provider)?.costUsd ?? 0)}
                                </td>
                              ))}
                              <td className="py-2 text-right text-foreground tabular-nums">
                                {formatUsd(period.costUsd)}
                              </td>
                              <td className="py-2 text-right text-muted-foreground tabular-nums">
                                {formatTokens(period.totalTokens)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </section>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </SidebarInset>
  );
}

/** Brand mark for the harness a row belongs to. */
function ProviderMark({
  provider,
  className,
}: {
  readonly provider: UsageProviderKind;
  readonly className: string;
}) {
  const Mark = PROVIDER_MARK[provider];
  return <Mark className={cn("shrink-0", className)} aria-hidden />;
}

function ProviderMetric({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] tracking-wide text-muted-foreground uppercase">{label}</div>
      <div className="mt-0.5 truncate text-xs text-foreground tabular-nums" title={value}>
        {value}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-border bg-card/35 px-4 py-3.5 shadow-sm">
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-xl font-medium tracking-tight text-foreground tabular-nums">
        {value}
      </span>
      <span className="truncate text-[11px] text-muted-foreground" title={detail}>
        {detail}
      </span>
    </div>
  );
}

/**
 * Says plainly when the totals are incomplete: an environment that failed, or
 * one whose transcripts another environment already reported. Environments
 * that are still answering never reach this notice; the page shows the
 * loading skeleton until every one is terminal.
 */
function UsageCoverageNotice({
  environments,
  duplicateSources,
  staleEnvironments,
}: {
  readonly environments: readonly EnvironmentUsageStatus[];
  readonly duplicateSources: readonly string[];
  readonly staleEnvironments: readonly string[];
}) {
  const failed = environments.filter((environment) => environment.error !== null);
  const stale = environments.filter((environment) =>
    staleEnvironments.includes(environment.environmentId),
  );
  if (failed.length === 0 && stale.length === 0 && duplicateSources.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
      {failed.map((environment) => (
        <span key={environment.label}>{environment.label} could not report usage.</span>
      ))}
      {stale.map((environment) => (
        <span key={environment.label}>
          {environment.label} runs an older server version and is excluded from totals.
        </span>
      ))}
      {duplicateSources.length > 0 ? (
        <span>
          Counted once across environments sharing a transcript directory:{" "}
          {duplicateSources.join(", ")}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Per-device progress while the page waits for every environment to answer.
 * Only rendered with two or more devices; a lone device has nothing to
 * enumerate.
 */
function UsageDeviceStrip({
  environments,
}: {
  readonly environments: readonly EnvironmentUsageStatus[];
}) {
  const scanning = environments.filter(
    (environment) => environment.summary === null && environment.error === null,
  );
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border border-border bg-muted/25 px-3 py-2 text-xs">
      {environments.map((environment) => {
        if (environment.summary !== null) {
          return (
            <span
              key={environment.environmentId}
              className="flex items-center gap-1 text-foreground"
            >
              <CheckIcon className="size-3 text-emerald-600 dark:text-emerald-300/90" aria-hidden />
              {environment.label}
            </span>
          );
        }
        if (environment.error !== null) {
          return (
            <span
              key={environment.environmentId}
              className="flex items-center gap-1 text-destructive"
            >
              <XIcon className="size-3" aria-hidden />
              {environment.label}
            </span>
          );
        }
        return (
          <span
            key={environment.environmentId}
            className="animate-status-pulse text-muted-foreground"
          >
            {environment.label}…
          </span>
        );
      })}
      <span className="ms-auto text-muted-foreground">
        {scanning.length === 1
          ? "1 device still scanning"
          : `${scanning.length} devices still scanning`}
      </span>
    </div>
  );
}

/** Deterministic bar heights (each unique: they double as keys). */
const SKELETON_BAR_HEIGHTS = [34, 58, 41, 72, 22, 12, 49, 63, 80, 38, 55, 26, 44, 67];

/** Static stand-in for the loaded usage layout. */
function UsageSkeleton({ resolution }: { readonly resolution: "day" | "hour" }) {
  return (
    <div className="contents" aria-label="Loading usage" aria-busy="true">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-5 rounded-xl border border-border bg-card/35 p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Processed tokens
              </span>
              <div className="mt-2 h-9 w-36 rounded-sm bg-muted" />
              <div className="mt-2 h-3 w-28 rounded-sm bg-muted" />
            </div>
            <div className="flex rounded-lg border border-border bg-background p-0.5">
              <span className="rounded-md bg-muted px-3 py-1.5 text-[10px] font-medium tracking-wide text-foreground uppercase shadow-sm">
                tokens
              </span>
              <span className="px-3 py-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                cost
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/70 pt-4">
            <h2 className="text-sm font-medium text-foreground">
              {resolution === "hour" ? "Hourly" : "Daily"} usage
            </h2>
            <div className="h-3 w-28 rounded-sm bg-muted" />
          </div>
          <div className="flex h-56 items-end gap-1 pl-14">
            {SKELETON_BAR_HEIGHTS.map((height) => (
              <div
                key={height}
                className="flex-1 rounded-sm bg-muted"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        <aside className="flex flex-col rounded-xl border border-border bg-card/35 p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Providers
              </span>
              <h2 className="mt-1 text-sm font-medium text-foreground">Usage distribution</h2>
            </div>
            <div className="h-6 w-14 rounded-full bg-muted" />
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {PROVIDER_ORDER.map((provider) => (
              <div
                key={provider}
                className="flex flex-col gap-3 rounded-lg border border-border bg-background/50 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <span className="flex size-7 items-center justify-center rounded-md border border-border bg-background">
                      <ProviderMark provider={provider} className="size-3.5" />
                    </span>
                    {PROVIDER_LABEL[provider]}
                  </span>
                  <div className="h-3 w-8 rounded-sm bg-muted" />
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted" />
                <div className="grid grid-cols-3 gap-2">
                  {(["Tokens", "Cost", "Records"] as const).map((label) => (
                    <div key={label}>
                      <div className="text-[9px] tracking-wide text-muted-foreground uppercase">
                        {label}
                      </div>
                      <div className="mt-1 h-3 w-10 rounded-sm bg-muted" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {["Processed tokens", "Cached input", "Uncached input", "Output", "Cache savings"].map(
          (label) => (
            <div
              key={label}
              className="flex min-w-0 flex-col gap-1 rounded-xl border border-border bg-card/35 px-4 py-3.5 shadow-sm"
            >
              <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {label}
              </span>
              <div className="my-1 h-5 w-16 rounded-sm bg-muted" />
              <div className="h-3 w-24 max-w-full rounded-sm bg-muted" />
            </div>
          ),
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card/35 p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div>
            <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Activity ledger
            </span>
            <h2 className="mt-1 text-sm font-medium text-foreground">Usage breakdown</h2>
          </div>
          <div className="h-7 w-24 rounded-md bg-muted" />
        </div>
        {["one", "two", "three"].map((row) => (
          <div key={row} className="grid grid-cols-[minmax(0,1fr)_5rem_4rem_5rem] gap-4 py-1">
            <div className="h-3 w-40 max-w-full rounded-sm bg-muted" />
            <div className="h-3 w-full rounded-sm bg-muted" />
            <div className="h-3 w-full rounded-sm bg-muted" />
            <div className="h-3 w-full rounded-sm bg-muted" />
          </div>
        ))}
      </section>
    </div>
  );
}
