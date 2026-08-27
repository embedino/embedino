import type { ProviderDriverKind, ProviderInstanceId } from "@embedino/contracts";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "~/lib/utils";
import { useClientSettings } from "~/hooks/useSettings";
import { isProviderInstancePickerReady, type ProviderInstanceEntry } from "../../providerInstances";
import { sortProviderModelItems } from "../../modelOrdering";
import { type ModelEsque, getTriggerDisplayModelName } from "./providerIconUtils";
import { ProviderInstanceIcon } from "./ProviderInstanceIcon";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";

type PickerSection = {
  entry: ProviderInstanceEntry;
  lockedOut: boolean;
  showBadge: boolean;
  models: ReadonlyArray<{ slug: string; name: string; isDefault: boolean }>;
};

/**
 * Two-view model picker showing ONE provider at a time:
 * - Models view: the viewed provider's header plus its models.
 * - Providers view ("Change"): every configured provider; picking one only
 *   switches which provider's models are browsed — the actual switch commits
 *   atomically through `onInstanceModelChange(instanceId, model)`.
 */
export const ModelPickerMenu = memo(function ModelPickerMenu(props: {
  /** The instance currently selected in the composer. */
  activeInstanceId: ProviderInstanceId;
  /** The selected model slug within `activeInstanceId`. */
  model: string;
  /**
   * When set, selection is locked to the given driver kind (editing an
   * already-sent turn). Instances of other kinds render disabled.
   */
  lockedProvider: ProviderDriverKind | null;
  lockedContinuationGroupKey?: string | null;
  /** All configured provider instances in display order. */
  instanceEntries: ReadonlyArray<ProviderInstanceEntry>;
  /** Model options per instance, keyed by instance id. Hidden/order
   * preferences from Settings are already applied upstream. */
  modelOptionsByInstance: ReadonlyMap<ProviderInstanceId, ReadonlyArray<ModelEsque>>;
  getModelDisabledReason?: (instanceId: ProviderInstanceId, model: string) => string | null;
  onInstanceModelChange: (instanceId: ProviderInstanceId, model: string) => void;
}) {
  // Favorites curated in Settings → Providers power the dedicated
  // "Favorites" view; they never reorder a provider's own model list.
  const favorites = useClientSettings((settings) => settings.favorites ?? []);
  const opensOnFavorites = useClientSettings(
    (settings) => settings.modelPickerOpensFavorites ?? false,
  );

  const sections = useMemo(
    () => buildSections(props),
    [
      props.instanceEntries,
      props.lockedContinuationGroupKey,
      props.lockedProvider,
      props.modelOptionsByInstance,
    ],
  );

  // Cross-provider favorites displayed in canonical order — providers in
  // their display sequence, models in each provider's preferred order — so
  // adding or re-adding a favorite never shuffles the list.
  const favoriteItems = useMemo(() => {
    const favoriteKeySet = new Set(
      favorites.map((favorite) => `${favorite.provider}:${favorite.model}`),
    );
    return sections.flatMap((section) =>
      section.models
        .filter((item) => favoriteKeySet.has(`${section.entry.instanceId}:${item.slug}`))
        .map((item) => ({
          section,
          slug: item.slug,
          name: getTriggerDisplayModelName({ slug: item.slug, name: item.name }),
        })),
    );
  }, [favorites, sections]);

  // Which provider's models are being browsed, plus an explicit mode flag —
  // the providers list is a real view, not "no section selected". When the
  // Settings toggle is on (and favorites exist), Favorites is the home view.
  const [mode, setMode] = useState<"models" | "providers" | "favorites">(() =>
    opensOnFavorites && favoriteItems.length > 0 ? "favorites" : "models",
  );
  const [favoritesIsHome] = useState(() => opensOnFavorites && favoriteItems.length > 0);
  const [viewedInstanceId, setViewedInstanceId] = useState<ProviderInstanceId | null>(() =>
    resolveInitialViewId(props.activeInstanceId, sections),
  );
  // Where the back chevron in the providers view returns to — the provider
  // that was being browsed when "Change" was pressed, not the committed one.
  const [returnInstanceId, setReturnInstanceId] = useState<ProviderInstanceId | null>(() =>
    resolveInitialViewId(props.activeInstanceId, sections),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRowRef = useRef<HTMLButtonElement | null>(null);

  const viewedSection = viewedInstanceId
    ? (sections.find((section) => section.entry.instanceId === viewedInstanceId) ?? sections[0])
    : undefined;

  // Short hover explanation for rows that cannot commit in this thread:
  // once a session starts, the picker locks to the session's provider family.
  const lockedReason = useMemo(() => {
    if (!props.lockedProvider) return null;
    const label = sections.find((section) => section.entry.driverKind === props.lockedProvider)
      ?.entry.displayName;
    return label
      ? `Locked to ${label} — start a new chat to switch`
      : "Locked to the current provider";
  }, [props.lockedProvider, sections]);

  // Fresh scroll position per view; land on the active model when it exists.
  useEffect(() => {
    if (selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ block: "nearest" });
      return;
    }
    scrollRef.current?.scrollTo({ top: 0 });
  }, [mode, viewedInstanceId]);

  return (
    <div
      ref={scrollRef}
      data-model-picker-menu="true"
      className="max-h-80 w-64 overflow-y-auto overscroll-contain p-1.5"
    >
      {mode === "models" && viewedSection ? (
        <ModelsView
          section={viewedSection}
          model={props.model}
          activeInstanceId={props.activeInstanceId}
          getModelDisabledReason={props.getModelDisabledReason}
          onInstanceModelChange={props.onInstanceModelChange}
          onChange={() => {
            setReturnInstanceId(viewedSection.entry.instanceId);
            setMode("providers");
          }}
          selectedRowRef={selectedRowRef}
        />
      ) : mode === "favorites" ? (
        <FavoritesView
          items={favoriteItems}
          activeInstanceId={props.activeInstanceId}
          model={props.model}
          isHome={favoritesIsHome}
          lockedReason={lockedReason}
          onBack={() => setMode("providers")}
          onChange={() => setMode("providers")}
          onInstanceModelChange={props.onInstanceModelChange}
        />
      ) : (
        <ProvidersView
          sections={sections}
          activeInstanceId={props.activeInstanceId}
          lockedReason={lockedReason}
          {...(favoriteItems.length > 0 ? { onOpenFavorites: () => setMode("favorites") } : {})}
          onSelect={(instanceId) => {
            setViewedInstanceId(instanceId);
            setMode("models");
          }}
          onBack={() => {
            const fallback = resolveInitialViewId(props.activeInstanceId, sections);
            setViewedInstanceId(returnInstanceId ?? fallback);
            if (!returnInstanceId && !fallback) setMode("providers");
            else setMode("models");
          }}
        />
      )}
    </div>
  );
});

function ModelsView(props: {
  section: PickerSection;
  model: string;
  activeInstanceId: ProviderInstanceId;
  getModelDisabledReason?:
    | ((instanceId: ProviderInstanceId, model: string) => string | null)
    | undefined;
  onInstanceModelChange: (instanceId: ProviderInstanceId, model: string) => void;
  onChange: () => void;
  selectedRowRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <section>
      <div className="sticky top-0 z-10 flex items-center gap-1.5 bg-background px-2 pb-1 pt-1">
        <span className="grid size-4 shrink-0 place-items-center text-muted-foreground [&_svg]:size-3.5">
          <ProviderInstanceIcon
            driverKind={props.section.entry.driverKind}
            displayName={props.section.entry.displayName}
            accentColor={props.section.entry.accentColor}
            showBadge={props.section.showBadge}
            className="size-3.5"
            iconClassName="size-3.5"
            indicatorBackground="var(--input)"
            badgeClassName="right-[-0.125rem] bottom-[-0.125rem] h-2 min-w-2 px-0.5 text-[6px]"
          />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
          {props.section.entry.displayName}
        </span>
        <button
          type="button"
          onClick={props.onChange}
          className="inline-flex shrink-0 cursor-pointer items-center rounded-full px-2 py-0.5 text-[11px] font-normal text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted focus-visible:bg-muted focus-visible:text-foreground"
          aria-label={`Change provider from ${props.section.entry.displayName}`}
        >
          Change
        </button>
      </div>
      <div>
        {props.section.models.map((item) => {
          const selected =
            props.section.entry.instanceId === props.activeInstanceId && item.slug === props.model;
          const disabledReason = props.getModelDisabledReason?.(
            props.section.entry.instanceId,
            item.slug,
          );
          const row = (
            <button
              ref={selected ? props.selectedRowRef : undefined}
              type="button"
              aria-disabled={Boolean(disabledReason) || undefined}
              onClick={() => {
                if (disabledReason) return;
                props.onInstanceModelChange(props.section.entry.instanceId, item.slug);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg py-1.5 pl-2.5 pr-2 text-left outline-none transition-colors",
                disabledReason
                  ? "aria-disabled:opacity-50"
                  : "hover:bg-muted focus-visible:bg-muted",
              )}
            >
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {getTriggerDisplayModelName({ slug: item.slug, name: item.name })}
              </span>
              {disabledReason ? (
                <span className="shrink-0 text-[10px] text-muted-foreground">Unavailable</span>
              ) : null}
              {item.isDefault && !selected ? (
                <span className="shrink-0 rounded-full bg-muted px-1.5 py-px text-[10px] leading-4 text-muted-foreground">
                  Default
                </span>
              ) : null}
              {selected ? (
                <CheckIcon aria-hidden="true" className="size-3.5 shrink-0 text-foreground" />
              ) : null}
            </button>
          );
          return disabledReason ? (
            <Tooltip key={item.slug}>
              <TooltipTrigger render={row} />
              <TooltipPopup side="right">{disabledReason}</TooltipPopup>
            </Tooltip>
          ) : (
            <div key={item.slug}>{row}</div>
          );
        })}
      </div>
    </section>
  );
}

function ProvidersView(props: {
  sections: ReadonlyArray<PickerSection>;
  activeInstanceId: ProviderInstanceId;
  lockedReason: string | null;
  onOpenFavorites?: () => void;
  onSelect: (instanceId: ProviderInstanceId) => void;
  onBack: () => void;
}) {
  return (
    <section>
      <div className="flex items-center gap-1 px-1 pb-1 pt-1">
        <button
          type="button"
          onClick={props.onBack}
          aria-label="Back to models"
          className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted focus-visible:bg-muted focus-visible:text-foreground"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-3.5" />
        </button>
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
          More providers
        </span>
      </div>
      <div>
        {props.onOpenFavorites ? (
          <button
            type="button"
            onClick={props.onOpenFavorites}
            className="flex w-full items-center gap-2 rounded-lg py-1.5 pl-2.5 pr-2 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
          >
            <span className="grid size-4 shrink-0 place-items-center">
              <StarIcon aria-hidden="true" className="size-3.5 fill-current text-foreground" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              Favorites
            </span>
            <ChevronRightIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground"
            />
          </button>
        ) : null}
        {props.sections.map((section) => {
          const isActive = section.entry.instanceId === props.activeInstanceId;
          const row = (
            <button
              type="button"
              aria-disabled={section.lockedOut || undefined}
              onClick={() => {
                if (!section.lockedOut) props.onSelect(section.entry.instanceId);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg py-1.5 pl-2.5 pr-2 text-left outline-none transition-colors",
                section.lockedOut
                  ? "aria-disabled:opacity-50"
                  : "hover:bg-muted focus-visible:bg-muted",
              )}
            >
              <span className="grid size-4 shrink-0 place-items-center text-muted-foreground [&_svg]:size-3.5">
                <ProviderInstanceIcon
                  driverKind={section.entry.driverKind}
                  displayName={section.entry.displayName}
                  accentColor={section.entry.accentColor}
                  showBadge={section.showBadge}
                  className="size-3.5"
                  iconClassName="size-3.5"
                  indicatorBackground="var(--input)"
                  badgeClassName="right-[-0.125rem] bottom-[-0.125rem] h-2 min-w-2 px-0.5 text-[6px]"
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {section.entry.displayName}
              </span>
              {section.lockedOut ? (
                <span className="shrink-0 text-[10px] text-muted-foreground">Unavailable</span>
              ) : null}
              {isActive ? (
                <>
                  <span className="shrink-0 text-[10px] text-muted-foreground">Current</span>
                  <CheckIcon aria-hidden="true" className="size-3.5 shrink-0 text-foreground" />
                </>
              ) : null}
            </button>
          );
          return section.lockedOut && props.lockedReason ? (
            <Tooltip key={section.entry.instanceId}>
              <TooltipTrigger render={row} />
              <TooltipPopup side="right">{props.lockedReason}</TooltipPopup>
            </Tooltip>
          ) : (
            <div key={section.entry.instanceId}>{row}</div>
          );
        })}
      </div>
    </section>
  );
}

function buildSections(props: {
  instanceEntries: ReadonlyArray<ProviderInstanceEntry>;
  lockedProvider: ProviderDriverKind | null;
  lockedContinuationGroupKey?: string | null;
  modelOptionsByInstance: ReadonlyMap<
    ProviderInstanceId,
    ReadonlyArray<ModelEsque & { isDefault?: boolean | undefined }>
  >;
}): ReadonlyArray<PickerSection> {
  // Only ready instances participate — an enabled-but-unavailable provider
  // (connection error, "not found", not installed) must not appear in the
  // picker, or picking its models would just surface the provider's error.
  const visibleEntries = props.instanceEntries.filter(isProviderInstancePickerReady);
  const driverKindCounts = new Map<ProviderDriverKind, number>();
  for (const entry of visibleEntries) {
    driverKindCounts.set(entry.driverKind, (driverKindCounts.get(entry.driverKind) ?? 0) + 1);
  }

  const matchesLocked = (entry: ProviderInstanceEntry): boolean => {
    if (props.lockedProvider === null) return true;
    if (entry.driverKind !== props.lockedProvider) return false;
    if (!props.lockedContinuationGroupKey) return true;
    return entry.continuationGroupKey === props.lockedContinuationGroupKey;
  };

  // Every configured model shows in one flat list — no legacy section, no
  // labels. The provider's preferred order (Settings → model order) is kept;
  // favorites never reorder it.
  return visibleEntries
    .map((entry) => {
      const models = sortProviderModelItems(
        (props.modelOptionsByInstance.get(entry.instanceId) ?? []).map((model) => ({
          slug: model.slug,
          name: model.name,
          instanceId: entry.instanceId,
          isDefault: model.isDefault ?? false,
        })),
      );
      return {
        entry,
        lockedOut: !matchesLocked(entry),
        showBadge: (driverKindCounts.get(entry.driverKind) ?? 0) > 1,
        models,
      };
    })
    .filter((section) => section.models.length > 0);
}

function FavoritesView(props: {
  items: ReadonlyArray<{
    section: PickerSection;
    slug: string;
    name: string;
  }>;
  activeInstanceId: ProviderInstanceId;
  model: string;
  /** Opened directly as the picker's home (Settings toggle on): the header
   * shows a "Change" pill instead of a back chevron. */
  isHome: boolean;
  lockedReason: string | null;
  onBack: () => void;
  onChange: () => void;
  onInstanceModelChange: (instanceId: ProviderInstanceId, model: string) => void;
}) {
  return (
    <section>
      <div className="flex items-center gap-1 px-1 pb-1 pt-1">
        {props.isHome ? (
          <>
            <span className="grid size-6 shrink-0 place-items-center">
              <StarIcon
                aria-hidden="true"
                className="size-3.5 fill-current text-muted-foreground"
              />
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
              Favorites
            </span>
            <button
              type="button"
              onClick={props.onChange}
              className="inline-flex shrink-0 cursor-pointer items-center rounded-full px-2 py-0.5 text-[11px] font-normal text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted focus-visible:bg-muted focus-visible:text-foreground"
              aria-label="Change provider from favorites"
            >
              Change
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={props.onBack}
              aria-label="Back to providers"
              className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted focus-visible:bg-muted focus-visible:text-foreground"
            >
              <ChevronLeftIcon aria-hidden="true" className="size-3.5" />
            </button>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
              Favorites
            </span>
          </>
        )}
      </div>
      <div>
        {props.items.map((item) => {
          const selected =
            item.section.entry.instanceId === props.activeInstanceId && item.slug === props.model;
          const lockedOut = item.section.lockedOut;
          const row = (
            <button
              type="button"
              aria-disabled={lockedOut || undefined}
              onClick={() => {
                if (lockedOut) return;
                props.onInstanceModelChange(item.section.entry.instanceId, item.slug);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg py-1.5 pl-2.5 pr-2 text-left outline-none transition-colors",
                lockedOut ? "aria-disabled:opacity-50" : "hover:bg-muted focus-visible:bg-muted",
              )}
            >
              <span className="grid size-4 shrink-0 place-items-center text-muted-foreground [&_svg]:size-3.5">
                <ProviderInstanceIcon
                  driverKind={item.section.entry.driverKind}
                  displayName={item.section.entry.displayName}
                  accentColor={item.section.entry.accentColor}
                  showBadge={false}
                  className="size-3.5"
                  iconClassName="size-3.5"
                  indicatorBackground="var(--input)"
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.name}</span>
              {selected ? (
                <CheckIcon aria-hidden="true" className="size-3.5 shrink-0 text-foreground" />
              ) : lockedOut ? (
                <span className="shrink-0 text-[10px] text-muted-foreground">Unavailable</span>
              ) : (
                <span className="shrink-0 max-w-20 truncate text-[10px] text-muted-foreground">
                  {item.section.entry.displayName}
                </span>
              )}
            </button>
          );
          return lockedOut && props.lockedReason ? (
            <Tooltip key={`${item.section.entry.instanceId}:${item.slug}`}>
              <TooltipTrigger render={row} />
              <TooltipPopup side="right">{props.lockedReason}</TooltipPopup>
            </Tooltip>
          ) : (
            <div key={`${item.section.entry.instanceId}:${item.slug}`}>{row}</div>
          );
        })}
      </div>
    </section>
  );
}

function resolveInitialViewId(
  activeInstanceId: ProviderInstanceId,
  sections: ReadonlyArray<PickerSection>,
): ProviderInstanceId | null {
  if (sections.some((section) => section.entry.instanceId === activeInstanceId)) {
    return activeInstanceId;
  }
  return sections[0]?.entry.instanceId ?? null;
}
