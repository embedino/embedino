import {
  DEFAULT_SERVER_SETTINGS,
  ProviderDriverKind,
  ProviderInstanceId,
} from "@embedino/contracts";
import { DEFAULT_CLIENT_SETTINGS } from "@embedino/contracts/settings";
import { describe, expect, it } from "vite-plus/test";

import { mergeEnvironmentSettings } from "./useSettings";

describe("mergeEnvironmentSettings", () => {
  it("combines the selected environment's server settings with client preferences", () => {
    const serverSettings = {
      ...DEFAULT_SERVER_SETTINGS,
      providerInstances: {
        [ProviderInstanceId.make("codex_remote")]: {
          driver: ProviderDriverKind.make("codex"),
          enabled: true,
        },
      },
    };
    const clientSettings = {
      ...DEFAULT_CLIENT_SETTINGS,
      favorites: [
        {
          provider: ProviderInstanceId.make("codex_remote"),
          model: "gpt-5.4",
        },
      ],
    };

    const settings = mergeEnvironmentSettings(serverSettings, clientSettings);

    expect(settings.providerInstances).toBe(serverSettings.providerInstances);
    expect(settings.favorites).toBe(clientSettings.favorites);
  });

  it("prefers shared server favorites over legacy browser-local values", () => {
    const serverFavorites = [
      {
        provider: ProviderInstanceId.make("codex"),
        model: "gpt-5.6-luna",
      },
    ];
    const settings = mergeEnvironmentSettings(
      {
        ...DEFAULT_SERVER_SETTINGS,
        favorites: serverFavorites,
        modelPickerOpensFavorites: true,
      },
      {
        ...DEFAULT_CLIENT_SETTINGS,
        favorites: [
          {
            provider: ProviderInstanceId.make("cursor"),
            model: "claude-sonnet",
          },
        ],
        modelPickerOpensFavorites: false,
      },
    );

    expect(settings.favorites).toBe(serverFavorites);
    expect(settings.modelPickerOpensFavorites).toBe(true);
  });
});
