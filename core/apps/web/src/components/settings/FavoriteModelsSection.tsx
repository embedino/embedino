import type { ProviderDriverKind, ProviderInstanceId, ServerProvider } from "@embedino/contracts";
import type { UnifiedSettings } from "@embedino/contracts/settings";
import { CheckIcon, PlusIcon, SearchIcon, StarIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { useClientSettings, useUpdateClientSettings } from "~/hooks/useSettings";
import { getAppModelOptionsForInstance } from "../../modelSelection";
import {
  applyProviderInstanceSettings,
  deriveProviderInstanceEntries,
  isProviderInstancePickerReady,
  sortProviderInstanceEntries,
} from "../../providerInstances";
import { ProviderInstanceIcon } from "../chat/ProviderInstanceIcon";
import { getTriggerDisplayModelName } from "../chat/providerIconUtils";
import { Popover, PopoverPopup, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";

type FavoriteEntry = { provider: ProviderInstanceId; model: string };

type CatalogItem = {
  instanceId: ProviderInstanceId;
  providerName: string;
  driverKind: ProviderDriverKind;
  accentColor?: string | undefined;
  slug: string;
  name: string;
};

const MAX_RENDERED_MATCHES = 100;

/**
 * Cross-provider favorite models, editable from one place: an "Add models"
 * search over every ready provider instance plus quick-remove rows. This is
 * the same `favorites` client setting the chat model picker surfaces at the
 * top of its provider list.
 */
export function FavoriteModelsSection(props: {
  serverProviders: ReadonlyArray<ServerProvider>;
  settings: UnifiedSettings;
  readOnly?: boolean;
}) {
  const favorites = useClientSettings((snapshot) => snapshot.favorites ?? []);
  const opensOnFavorites = useClientSettings(
    (snapshot) => snapshot.modelPickerOpensFavorites ?? false,
  );
  const updateClientSettings = useUpdateClientSettings();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [query, setQuery] = useState("");

  const catalog = useMemo(
    () => buildCatalog(props.serverProviders, props.settings),
    [props.serverProviders, props.settings],
  );
  const favoriteKeySet = useMemo(
    () => new Set(favorites.map((favorite) => `${favorite.provider}:${favorite.model}`)),
    [favorites],
  );

  // Favorites displayed in canonical order — providers in their display
  // sequence, models in each provider's preferred order — independent of the
  // order they were added (the stored array keeps insertion order).
  const resolvedFavorites = useMemo(() => {
    return catalog.flatMap((item) => {
      if (!favoriteKeySet.has(`${item.instanceId}:${item.slug}`)) return [];
      const favorite = favorites.find(
        (candidate) => candidate.provider === item.instanceId && candidate.model === item.slug,
      );
      return favorite ? [{ ...favorite, item }] : [];
    });
  }, [catalog, favoriteKeySet, favorites]);

  const toggleFavorite = (item: CatalogItem) => {
    const exists = favoriteKeySet.has(`${item.instanceId}:${item.slug}`);
    const next: FavoriteEntry[] = exists
      ? favorites.filter(
          (favorite) => !(favorite.provider === item.instanceId && favorite.model === item.slug),
        )
      : [...favorites, { provider: item.instanceId, model: item.slug }];
    updateClientSettings({ favorites: next });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
            <StarIcon aria-hidden="true" className="size-3.5 fill-current text-muted-foreground" />
            Favorite models
          </div>
          <p className="mt-1 text-muted-foreground text-xs leading-4">
            Pick go-to models from any provider — they sit at the top of the chat model picker.
          </p>
        </div>
        <Popover open={isAddOpen} onOpenChange={setIsAddOpen}>
          {" "}
          <PopoverTrigger
            render={
              <button
                type="button"
                disabled={props.readOnly || undefined}
                onClick={() => setIsAddOpen(true)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-input bg-popover px-2.5 py-1 font-medium text-foreground text-xs shadow-xs outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-64"
                aria-label="Add favorite models"
              />
            }
          >
            <PlusIcon aria-hidden="true" className="size-3.5" />
            Add models
          </PopoverTrigger>
          <PopoverPopup
            align="end"
            sideOffset={6}
            className="rounded-xl border border-border bg-background p-0 shadow-[0_10px_18px_rgba(0,0,0,0.14)] before:hidden [-webkit-backdrop-filter:none]! [--viewport-inline-padding:0] [backdrop-filter:none]!"
            viewportClassName="rounded-[inherit] overflow-hidden p-0!"
          >
            <FavoriteModelsPickerContent
              query={query}
              onQueryChange={setQuery}
              catalog={catalog}
              favoriteKeySet={favoriteKeySet}
              onToggle={toggleFavorite}
            />
          </PopoverPopup>
        </Popover>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/40 px-4 py-3">
        <div className="min-w-0">
          <label className="font-medium text-foreground text-sm">
            Open the picker on Favorites
          </label>
          <p className="text-muted-foreground text-xs leading-4">
            The chat model pill opens straight to this list; “Change” still reaches every provider.
          </p>
        </div>
        <Switch
          checked={opensOnFavorites}
          onCheckedChange={(checked) => {
            updateClientSettings({ modelPickerOpensFavorites: checked });
          }}
        />
      </div>

      <div className="divide-y divide-border/40 border-t border-border/40">
        {resolvedFavorites.length === 0 ? (
          <p className="px-4 py-3 text-muted-foreground text-xs">
            No favorite models yet — use “Add models” to pick a few.
          </p>
        ) : (
          resolvedFavorites.map(({ provider, model, item }) => (
            <div key={`${provider}:${model}`} className="flex items-center gap-2 px-4 py-2">
              <span className="grid size-4 shrink-0 place-items-center text-muted-foreground [&_svg]:size-3.5">
                <ProviderInstanceIcon
                  driverKind={item.driverKind}
                  displayName={item.providerName}
                  {...(item.accentColor ? { accentColor: item.accentColor } : {})}
                  showBadge={false}
                  className="size-3.5"
                  iconClassName="size-3.5"
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-foreground text-sm">
                {getTriggerDisplayModelName({ slug: item.slug, name: item.name })}
              </span>
              <span className="shrink-0 text-muted-foreground text-xs">{item.providerName}</span>
              {!props.readOnly ? (
                <button
                  type="button"
                  onClick={() =>
                    toggleFavorite({
                      instanceId: provider,
                      providerName: item.providerName,
                      driverKind: item.driverKind,
                      ...(item.accentColor ? { accentColor: item.accentColor } : {}),
                      slug: model,
                      name: item.name,
                    })
                  }
                  className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted"
                  aria-label={`Remove ${item.name} from favorites`}
                >
                  <XIcon aria-hidden="true" className="size-3.5" />
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FavoriteModelsPickerContent(props: {
  query: string;
  onQueryChange: (next: string) => void;
  catalog: ReadonlyArray<CatalogItem>;
  favoriteKeySet: ReadonlySet<string>;
  onToggle: (item: CatalogItem) => void;
}) {
  const needle = props.query.trim().toLowerCase();
  const matches = useMemo(() => {
    const base = needle ? props.catalog.filter(matchCatalogItem(needle)) : props.catalog;
    return base.slice(0, MAX_RENDERED_MATCHES);
  }, [needle, props.catalog]);
  const totalMatches = needle
    ? props.catalog.filter(matchCatalogItem(needle)).length
    : props.catalog.length;

  return (
    <div className="flex max-h-80 w-72 flex-col overflow-hidden">
      <div className="relative shrink-0 px-2.5 pt-2.5">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground/55"
        />
        <input
          value={props.query}
          onChange={(event) => props.onQueryChange(event.target.value)}
          placeholder="Search all models…"
          autoFocus
          className="h-8 w-full rounded-lg border border-border/60 bg-transparent ps-7 pe-2 text-sm outline-none transition-colors focus:border-ring"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {matches.length === 0 ? (
          <p className="px-2 py-6 text-center text-muted-foreground text-xs">No models found.</p>
        ) : (
          matches.map((item) => {
            const isActive = props.favoriteKeySet.has(`${item.instanceId}:${item.slug}`);
            return (
              <button
                key={`${item.instanceId}:${item.slug}`}
                type="button"
                onClick={() => props.onToggle(item)}
                className="flex w-full items-center gap-2 rounded-lg py-1.5 pl-2 pr-2 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
              >
                <span className="grid size-4 shrink-0 place-items-center text-muted-foreground [&_svg]:size-3.5">
                  <ProviderInstanceIcon
                    driverKind={item.driverKind}
                    displayName={item.providerName}
                    {...(item.accentColor ? { accentColor: item.accentColor } : {})}
                    showBadge={false}
                    className="size-4"
                    iconClassName="size-3.5"
                  />
                </span>
                <span className="min-w-0 flex-1 truncate text-foreground text-sm">
                  {getTriggerDisplayModelName({ slug: item.slug, name: item.name })}
                </span>
                <span className="shrink-0 text-muted-foreground text-xs">{item.providerName}</span>
                {isActive ? (
                  <CheckIcon aria-hidden="true" className="size-3.5 shrink-0 text-foreground" />
                ) : null}
              </button>
            );
          })
        )}
        {matches.length < totalMatches ? (
          <p className="px-2 py-2 text-center text-muted-foreground text-xs">
            Refine the search to see more.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function matchCatalogItem(needle: string) {
  return (item: CatalogItem) =>
    item.name.toLowerCase().includes(needle) ||
    item.slug.toLowerCase().includes(needle) ||
    item.providerName.toLowerCase().includes(needle);
}

function buildCatalog(
  serverProviders: ReadonlyArray<ServerProvider>,
  settings: UnifiedSettings,
): ReadonlyArray<CatalogItem> {
  const entries = sortProviderInstanceEntries(
    applyProviderInstanceSettings(deriveProviderInstanceEntries(serverProviders), settings),
  ).filter(isProviderInstancePickerReady);
  return entries.flatMap((entry) =>
    getAppModelOptionsForInstance(settings, entry).map((option) => ({
      instanceId: entry.instanceId,
      providerName: entry.displayName,
      driverKind: entry.driverKind,
      accentColor: entry.accentColor,
      slug: option.slug,
      name: option.name,
    })),
  );
}
