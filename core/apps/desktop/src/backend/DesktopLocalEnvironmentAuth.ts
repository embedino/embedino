import { bootstrapRemoteBearerSession } from "@embedino/client-runtime/authorization";
import { PRIMARY_LOCAL_ENVIRONMENT_ID } from "@embedino/contracts";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Ref from "effect/Ref";
import * as Schema from "effect/Schema";
import * as Semaphore from "effect/Semaphore";
import * as Clock from "effect/Clock";
import * as HttpClient from "effect/unstable/http/HttpClient";

import * as DesktopBackendPool from "./DesktopBackendPool.ts";

export class DesktopLocalEnvironmentAuthBackendNotConfiguredError extends Schema.TaggedErrorClass<DesktopLocalEnvironmentAuthBackendNotConfiguredError>()(
  "DesktopLocalEnvironmentAuthBackendNotConfiguredError",
  {},
) {
  override get message(): string {
    return "Local backend is not configured.";
  }
}

export class DesktopLocalEnvironmentAuthSessionBootstrapError extends Schema.TaggedErrorClass<DesktopLocalEnvironmentAuthSessionBootstrapError>()(
  "DesktopLocalEnvironmentAuthSessionBootstrapError",
  { cause: Schema.Defect() },
) {
  override get message(): string {
    return "Failed to create the local desktop bearer session.";
  }
}

export const DesktopLocalEnvironmentAuthError = Schema.Union([
  DesktopLocalEnvironmentAuthBackendNotConfiguredError,
  DesktopLocalEnvironmentAuthSessionBootstrapError,
]);
export type DesktopLocalEnvironmentAuthError = typeof DesktopLocalEnvironmentAuthError.Type;

export class DesktopLocalEnvironmentAuth extends Context.Service<
  DesktopLocalEnvironmentAuth,
  {
    readonly getBearerToken: Effect.Effect<string, DesktopLocalEnvironmentAuthError>;
  }
>()("@embedino/desktop/backend/DesktopLocalEnvironmentAuth") {}

/** Re-mint this far before the session actually expires. */
const SESSION_RENEW_MARGIN_MS = 5 * 60 * 1_000;

export const make = Effect.gen(function* () {
  const pool = yield* DesktopBackendPool.DesktopBackendPool;
  const httpClient = yield* HttpClient.HttpClient;
  // The cached token is only valid until its expiry: a main-process cache
  // that outlives the server's session TTL would hand every future renderer
  // a token the server rejects, with no recovery short of an app restart.
  const tokenRef = yield* Ref.make(
    Option.none<{ readonly token: string; readonly expiresAtMillis: number }>(),
  );
  const mutex = yield* Semaphore.make(1);

  const getBearerToken = mutex
    .withPermits(1)(
      Effect.gen(function* () {
        const cached = yield* Ref.get(tokenRef);
        const now = yield* Clock.currentTimeMillis;
        if (Option.isSome(cached) && cached.value.expiresAtMillis - now > SESSION_RENEW_MARGIN_MS) {
          return cached.value.token;
        }

        const instances = yield* pool.list;
        const primary = instances.find((instance) => instance.id === PRIMARY_LOCAL_ENVIRONMENT_ID);
        const configOption = primary === undefined ? Option.none() : yield* primary.currentConfig;
        if (Option.isNone(configOption)) {
          return yield* new DesktopLocalEnvironmentAuthBackendNotConfiguredError();
        }
        const config = configOption.value;
        const credential = config.bootstrap.desktopBootstrapToken;
        if (!credential) {
          return yield* new DesktopLocalEnvironmentAuthBackendNotConfiguredError();
        }
        const session = yield* bootstrapRemoteBearerSession({
          httpBaseUrl: config.httpBaseUrl.href,
          credential,
          clientMetadata: {
            label: "Embedino Desktop",
            deviceType: "desktop",
          },
        }).pipe(
          Effect.provideService(HttpClient.HttpClient, httpClient),
          Effect.mapError(
            (cause) =>
              new DesktopLocalEnvironmentAuthSessionBootstrapError({
                cause,
              }),
          ),
        );
        yield* Ref.set(
          tokenRef,
          Option.some({
            token: session.access_token,
            expiresAtMillis: now + session.expires_in * 1000,
          }),
        );
        return session.access_token;
      }),
    )
    .pipe(Effect.withSpan("desktop.localEnvironmentAuth.getBearerToken"));

  return DesktopLocalEnvironmentAuth.of({ getBearerToken });
});

export const layer = Layer.effect(DesktopLocalEnvironmentAuth, make);
