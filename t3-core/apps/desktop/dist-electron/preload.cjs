let electron = require("electron");
//#region ../../node_modules/.pnpm/@clerk+electron@0.0.24_@cle_3e8d324ec1a3983b88fcd34e9a34bf6d/node_modules/@clerk/electron/dist/esm/ipc-DSk37snY.js
const TOKEN_CACHE_CHANNELS = {
	getToken: "clerk:token-cache:get",
	saveToken: "clerk:token-cache:save",
	clearToken: "clerk:token-cache:clear"
};
const OAUTH_TRANSPORT_CHANNELS = {
	getRedirectUrl: "clerk:oauth-transport:get-redirect-url",
	open: "clerk:oauth-transport:open"
};
const PASSKEY_CHANNELS = {
	create: "clerk:passkeys:create",
	get: "clerk:passkeys:get",
	capabilities: "clerk:passkeys:capabilities"
};
//#endregion
//#region ../../node_modules/.pnpm/@clerk+electron@0.0.24_@cle_3e8d324ec1a3983b88fcd34e9a34bf6d/node_modules/@clerk/electron/dist/esm/preload/index.js
/** Exposes the native passkey bridge to the renderer. */
function setupPasskeysPreload() {
	const bridge = {
		create: (options) => electron.ipcRenderer.invoke(PASSKEY_CHANNELS.create, options),
		get: (options) => electron.ipcRenderer.invoke(PASSKEY_CHANNELS.get, options),
		capabilities: () => electron.ipcRenderer.invoke(PASSKEY_CHANNELS.capabilities),
		electronMajor: Number.parseInt(process.versions.electron ?? "", 10) || 0,
		platform: process.platform
	};
	if (process.contextIsolated) electron.contextBridge.exposeInMainWorld("__clerk_internal_electron_passkeys", bridge);
	else window.__clerk_internal_electron_passkeys = bridge;
}
/**
* Exposes Clerk's Electron bridge from the preload script to the renderer.
*
* Call this from an Electron preload script. It publishes a narrow internal bridge used by
* `@clerk/electron/react` for token storage and OAuth transport.
*/
function exposeClerkBridge(options) {
	const bridge = {
		tokenCache: {
			getToken: (key) => electron.ipcRenderer.invoke(TOKEN_CACHE_CHANNELS.getToken, key),
			saveToken: (key, value) => electron.ipcRenderer.invoke(TOKEN_CACHE_CHANNELS.saveToken, key, value),
			clearToken: (key) => electron.ipcRenderer.invoke(TOKEN_CACHE_CHANNELS.clearToken, key)
		},
		oauthTransport: {
			getRedirectUrl: () => electron.ipcRenderer.invoke(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl),
			open: (url) => electron.ipcRenderer.invoke(OAUTH_TRANSPORT_CHANNELS.open, url)
		}
	};
	if (process.contextIsolated) electron.contextBridge.exposeInMainWorld("__clerk_internal_electron", bridge);
	else window.__clerk_internal_electron = bridge;
	if (options?.passkeys) setupPasskeysPreload();
}
//#endregion
//#region src/ipc/channels.ts
const PICK_FOLDER_CHANNEL = "desktop:pick-folder";
const PICK_THEME_FILES_CHANNEL = "desktop:pick-theme-files";
const SET_THEME_CHANNEL = "desktop:set-theme";
const CONTEXT_MENU_CHANNEL = "desktop:context-menu";
const OPEN_EXTERNAL_CHANNEL = "desktop:open-external";
const MENU_ACTION_CHANNEL = "desktop:menu-action";
const GET_WINDOW_FULLSCREEN_STATE_CHANNEL = "desktop:get-window-fullscreen-state";
const WINDOW_FULLSCREEN_STATE_CHANNEL = "desktop:window-fullscreen-state";
const UPDATE_STATE_CHANNEL = "desktop:update-state";
const UPDATE_GET_STATE_CHANNEL = "desktop:update-get-state";
const UPDATE_SET_CHANNEL_CHANNEL = "desktop:update-set-channel";
const UPDATE_DOWNLOAD_CHANNEL = "desktop:update-download";
const UPDATE_INSTALL_CHANNEL = "desktop:update-install";
const UPDATE_CHECK_CHANNEL = "desktop:update-check";
const GET_APP_BRANDING_CHANNEL = "desktop:get-app-branding";
const GET_LOCAL_ENVIRONMENT_BOOTSTRAPS_CHANNEL = "desktop:get-local-environment-bootstraps";
const GET_LOCAL_ENVIRONMENT_BEARER_TOKEN_CHANNEL = "desktop:get-local-environment-bearer-token";
const GET_CLIENT_SETTINGS_CHANNEL = "desktop:get-client-settings";
const SET_CLIENT_SETTINGS_CHANNEL = "desktop:set-client-settings";
const GET_CONNECTION_CATALOG_CHANNEL = "desktop:get-connection-catalog";
const SET_CONNECTION_CATALOG_CHANNEL = "desktop:set-connection-catalog";
const CLEAR_CONNECTION_CATALOG_CHANNEL = "desktop:clear-connection-catalog";
const DISCOVER_SSH_HOSTS_CHANNEL = "desktop:discover-ssh-hosts";
const ENSURE_SSH_ENVIRONMENT_CHANNEL = "desktop:ensure-ssh-environment";
const DISCONNECT_SSH_ENVIRONMENT_CHANNEL = "desktop:disconnect-ssh-environment";
const FETCH_SSH_ENVIRONMENT_DESCRIPTOR_CHANNEL = "desktop:fetch-ssh-environment-descriptor";
const BOOTSTRAP_SSH_BEARER_SESSION_CHANNEL = "desktop:bootstrap-ssh-bearer-session";
const FETCH_SSH_SESSION_STATE_CHANNEL = "desktop:fetch-ssh-session-state";
const ISSUE_SSH_WEBSOCKET_TOKEN_CHANNEL = "desktop:issue-ssh-websocket-token";
const SSH_PASSWORD_PROMPT_CHANNEL = "desktop:ssh-password-prompt";
const RESOLVE_SSH_PASSWORD_PROMPT_CHANNEL = "desktop:resolve-ssh-password-prompt";
const GET_SERVER_EXPOSURE_STATE_CHANNEL = "desktop:get-server-exposure-state";
const SET_SERVER_EXPOSURE_MODE_CHANNEL = "desktop:set-server-exposure-mode";
const SET_TAILSCALE_SERVE_ENABLED_CHANNEL = "desktop:set-tailscale-serve-enabled";
const GET_ADVERTISED_ENDPOINTS_CHANNEL = "desktop:get-advertised-endpoints";
const GET_WSL_STATE_CHANNEL = "desktop:get-wsl-state";
const SET_WSL_BACKEND_ENABLED_CHANNEL = "desktop:set-wsl-backend-enabled";
const SET_WSL_DISTRO_CHANNEL = "desktop:set-wsl-distro";
const SET_WSL_ONLY_CHANNEL = "desktop:set-wsl-only";
const PREVIEW_CREATE_TAB_CHANNEL = "desktop:preview-create-tab";
const PREVIEW_CLOSE_TAB_CHANNEL = "desktop:preview-close-tab";
const PREVIEW_REGISTER_WEBVIEW_CHANNEL = "desktop:preview-register-webview";
const PREVIEW_NAVIGATE_CHANNEL = "desktop:preview-navigate";
const PREVIEW_GO_BACK_CHANNEL = "desktop:preview-go-back";
const PREVIEW_GO_FORWARD_CHANNEL = "desktop:preview-go-forward";
const PREVIEW_REFRESH_CHANNEL = "desktop:preview-refresh";
const PREVIEW_ZOOM_IN_CHANNEL = "desktop:preview-zoom-in";
const PREVIEW_ZOOM_OUT_CHANNEL = "desktop:preview-zoom-out";
const PREVIEW_RESET_ZOOM_CHANNEL = "desktop:preview-reset-zoom";
const PREVIEW_HARD_RELOAD_CHANNEL = "desktop:preview-hard-reload";
const PREVIEW_SET_COLOR_SCHEME_CHANNEL = "desktop:preview-set-color-scheme";
const PREVIEW_OPEN_DEVTOOLS_CHANNEL = "desktop:preview-open-devtools";
const PREVIEW_CLEAR_COOKIES_CHANNEL = "desktop:preview-clear-cookies";
const PREVIEW_CLEAR_CACHE_CHANNEL = "desktop:preview-clear-cache";
const PREVIEW_GET_CONFIG_CHANNEL = "desktop:preview-get-config";
const PREVIEW_SET_ANNOTATION_THEME_CHANNEL = "desktop:preview-set-annotation-theme";
const PREVIEW_PICK_ELEMENT_CHANNEL = "desktop:preview-pick-element";
const PREVIEW_CANCEL_PICK_ELEMENT_CHANNEL = "desktop:preview-cancel-pick-element";
const PREVIEW_CAPTURE_SCREENSHOT_CHANNEL = "desktop:preview-capture-screenshot";
const PREVIEW_REVEAL_ARTIFACT_CHANNEL = "desktop:preview-reveal-artifact";
const PREVIEW_COPY_ARTIFACT_CHANNEL = "desktop:preview-copy-artifact";
const PREVIEW_PICTURE_IN_PICTURE_OPEN_CHANNEL = "desktop:preview-pip-open";
const PREVIEW_PICTURE_IN_PICTURE_CLOSE_CHANNEL = "desktop:preview-pip-close";
const PREVIEW_AUTOMATION_STATUS_CHANNEL = "desktop:preview-automation-status";
const PREVIEW_AUTOMATION_SNAPSHOT_CHANNEL = "desktop:preview-automation-snapshot";
const PREVIEW_AUTOMATION_CLICK_CHANNEL = "desktop:preview-automation-click";
const PREVIEW_AUTOMATION_TYPE_CHANNEL = "desktop:preview-automation-type";
const PREVIEW_AUTOMATION_PRESS_CHANNEL = "desktop:preview-automation-press";
const PREVIEW_AUTOMATION_SCROLL_CHANNEL = "desktop:preview-automation-scroll";
const PREVIEW_AUTOMATION_EVALUATE_CHANNEL = "desktop:preview-automation-evaluate";
const PREVIEW_AUTOMATION_WAIT_FOR_CHANNEL = "desktop:preview-automation-wait-for";
const PREVIEW_RECORDING_START_CHANNEL = "desktop:preview-recording-start";
const PREVIEW_RECORDING_STOP_CHANNEL = "desktop:preview-recording-stop";
const PREVIEW_RECORDING_SAVE_CHANNEL = "desktop:preview-recording-save";
const PREVIEW_RECORDING_FRAME_CHANNEL = "desktop:preview-recording-frame";
const PREVIEW_STATE_CHANGE_CHANNEL = "desktop:preview-state-change";
const PREVIEW_POINTER_EVENT_CHANNEL = "desktop:preview-pointer-event";
//#endregion
//#region src/preload.ts
exposeClerkBridge({ passkeys: true });
function unwrapEnsureSshEnvironmentResult(result) {
	if (typeof result === "object" && result !== null && "type" in result && result.type === "ssh-password-prompt-cancelled") {
		const message = "message" in result && typeof result.message === "string" ? result.message : "SSH authentication cancelled.";
		throw new Error(message);
	}
	return result;
}
electron.contextBridge.exposeInMainWorld("desktopBridge", {
	getAppBranding: () => {
		const result = electron.ipcRenderer.sendSync(GET_APP_BRANDING_CHANNEL);
		if (typeof result !== "object" || result === null) return null;
		return result;
	},
	getLocalEnvironmentBootstraps: () => {
		const result = electron.ipcRenderer.sendSync(GET_LOCAL_ENVIRONMENT_BOOTSTRAPS_CHANNEL);
		if (!Array.isArray(result)) return [];
		return result;
	},
	getLocalEnvironmentBearerToken: () => electron.ipcRenderer.invoke(GET_LOCAL_ENVIRONMENT_BEARER_TOKEN_CHANNEL),
	getClientSettings: () => electron.ipcRenderer.invoke(GET_CLIENT_SETTINGS_CHANNEL),
	setClientSettings: (settings) => electron.ipcRenderer.invoke(SET_CLIENT_SETTINGS_CHANNEL, settings),
	getConnectionCatalog: () => electron.ipcRenderer.invoke(GET_CONNECTION_CATALOG_CHANNEL),
	setConnectionCatalog: (catalog) => electron.ipcRenderer.invoke(SET_CONNECTION_CATALOG_CHANNEL, catalog),
	clearConnectionCatalog: () => electron.ipcRenderer.invoke(CLEAR_CONNECTION_CATALOG_CHANNEL),
	discoverSshHosts: () => electron.ipcRenderer.invoke(DISCOVER_SSH_HOSTS_CHANNEL),
	ensureSshEnvironment: async (target, options) => unwrapEnsureSshEnvironmentResult(await electron.ipcRenderer.invoke(ENSURE_SSH_ENVIRONMENT_CHANNEL, {
		target,
		...options === void 0 ? {} : { options }
	})),
	disconnectSshEnvironment: (target) => electron.ipcRenderer.invoke(DISCONNECT_SSH_ENVIRONMENT_CHANNEL, target),
	fetchSshEnvironmentDescriptor: (httpBaseUrl) => electron.ipcRenderer.invoke(FETCH_SSH_ENVIRONMENT_DESCRIPTOR_CHANNEL, { httpBaseUrl }),
	bootstrapSshBearerSession: (httpBaseUrl, credential) => electron.ipcRenderer.invoke(BOOTSTRAP_SSH_BEARER_SESSION_CHANNEL, {
		httpBaseUrl,
		credential
	}),
	fetchSshSessionState: (httpBaseUrl, bearerToken) => electron.ipcRenderer.invoke(FETCH_SSH_SESSION_STATE_CHANNEL, {
		httpBaseUrl,
		bearerToken
	}),
	issueSshWebSocketTicket: (httpBaseUrl, bearerToken) => electron.ipcRenderer.invoke(ISSUE_SSH_WEBSOCKET_TOKEN_CHANNEL, {
		httpBaseUrl,
		bearerToken
	}),
	onSshPasswordPrompt: (listener) => {
		const wrappedListener = (_event, request) => {
			if (typeof request !== "object" || request === null) return;
			listener(request);
		};
		electron.ipcRenderer.on(SSH_PASSWORD_PROMPT_CHANNEL, wrappedListener);
		return () => {
			electron.ipcRenderer.removeListener(SSH_PASSWORD_PROMPT_CHANNEL, wrappedListener);
		};
	},
	resolveSshPasswordPrompt: (requestId, password) => electron.ipcRenderer.invoke(RESOLVE_SSH_PASSWORD_PROMPT_CHANNEL, {
		requestId,
		password
	}),
	getServerExposureState: () => electron.ipcRenderer.invoke(GET_SERVER_EXPOSURE_STATE_CHANNEL),
	setServerExposureMode: (mode) => electron.ipcRenderer.invoke(SET_SERVER_EXPOSURE_MODE_CHANNEL, mode),
	setTailscaleServeEnabled: (input) => electron.ipcRenderer.invoke(SET_TAILSCALE_SERVE_ENABLED_CHANNEL, input),
	getAdvertisedEndpoints: () => electron.ipcRenderer.invoke(GET_ADVERTISED_ENDPOINTS_CHANNEL),
	getWslState: () => electron.ipcRenderer.invoke(GET_WSL_STATE_CHANNEL),
	setWslBackendEnabled: (enabled) => electron.ipcRenderer.invoke(SET_WSL_BACKEND_ENABLED_CHANNEL, enabled),
	setWslDistro: (distro) => electron.ipcRenderer.invoke(SET_WSL_DISTRO_CHANNEL, distro),
	setWslOnly: (enabled) => electron.ipcRenderer.invoke(SET_WSL_ONLY_CHANNEL, enabled),
	pickFolder: (options) => electron.ipcRenderer.invoke(PICK_FOLDER_CHANNEL, options),
	pickThemeFiles: () => electron.ipcRenderer.invoke(PICK_THEME_FILES_CHANNEL, void 0),
	setTheme: (theme) => electron.ipcRenderer.invoke(SET_THEME_CHANNEL, theme),
	showContextMenu: (items, position) => electron.ipcRenderer.invoke(CONTEXT_MENU_CHANNEL, {
		items,
		...position === void 0 ? {} : { position }
	}),
	openExternal: (url) => electron.ipcRenderer.invoke(OPEN_EXTERNAL_CHANNEL, url),
	onMenuAction: (listener) => {
		const wrappedListener = (_event, action) => {
			if (typeof action !== "string") return;
			listener(action);
		};
		electron.ipcRenderer.on(MENU_ACTION_CHANNEL, wrappedListener);
		return () => {
			electron.ipcRenderer.removeListener(MENU_ACTION_CHANNEL, wrappedListener);
		};
	},
	getWindowFullscreenState: () => electron.ipcRenderer.sendSync(GET_WINDOW_FULLSCREEN_STATE_CHANNEL) === true,
	onWindowFullscreenStateChange: (listener) => {
		const wrappedListener = (_event, fullscreen) => {
			if (typeof fullscreen !== "boolean") return;
			listener(fullscreen);
		};
		electron.ipcRenderer.on(WINDOW_FULLSCREEN_STATE_CHANNEL, wrappedListener);
		return () => {
			electron.ipcRenderer.removeListener(WINDOW_FULLSCREEN_STATE_CHANNEL, wrappedListener);
		};
	},
	getUpdateState: () => electron.ipcRenderer.invoke(UPDATE_GET_STATE_CHANNEL),
	setUpdateChannel: (channel) => electron.ipcRenderer.invoke(UPDATE_SET_CHANNEL_CHANNEL, channel),
	checkForUpdate: () => electron.ipcRenderer.invoke(UPDATE_CHECK_CHANNEL),
	downloadUpdate: () => electron.ipcRenderer.invoke(UPDATE_DOWNLOAD_CHANNEL),
	installUpdate: () => electron.ipcRenderer.invoke(UPDATE_INSTALL_CHANNEL),
	onUpdateState: (listener) => {
		const wrappedListener = (_event, state) => {
			if (typeof state !== "object" || state === null) return;
			listener(state);
		};
		electron.ipcRenderer.on(UPDATE_STATE_CHANNEL, wrappedListener);
		return () => {
			electron.ipcRenderer.removeListener(UPDATE_STATE_CHANNEL, wrappedListener);
		};
	},
	preview: {
		createTab: (tabId) => electron.ipcRenderer.invoke(PREVIEW_CREATE_TAB_CHANNEL, { tabId }),
		closeTab: (tabId) => electron.ipcRenderer.invoke(PREVIEW_CLOSE_TAB_CHANNEL, { tabId }),
		registerWebview: (tabId, webContentsId) => electron.ipcRenderer.invoke(PREVIEW_REGISTER_WEBVIEW_CHANNEL, {
			tabId,
			webContentsId
		}),
		navigate: (tabId, url) => electron.ipcRenderer.invoke(PREVIEW_NAVIGATE_CHANNEL, {
			tabId,
			url
		}),
		goBack: (tabId) => electron.ipcRenderer.invoke(PREVIEW_GO_BACK_CHANNEL, { tabId }),
		goForward: (tabId) => electron.ipcRenderer.invoke(PREVIEW_GO_FORWARD_CHANNEL, { tabId }),
		refresh: (tabId) => electron.ipcRenderer.invoke(PREVIEW_REFRESH_CHANNEL, { tabId }),
		zoomIn: (tabId) => electron.ipcRenderer.invoke(PREVIEW_ZOOM_IN_CHANNEL, { tabId }),
		zoomOut: (tabId) => electron.ipcRenderer.invoke(PREVIEW_ZOOM_OUT_CHANNEL, { tabId }),
		resetZoom: (tabId) => electron.ipcRenderer.invoke(PREVIEW_RESET_ZOOM_CHANNEL, { tabId }),
		hardReload: (tabId) => electron.ipcRenderer.invoke(PREVIEW_HARD_RELOAD_CHANNEL, { tabId }),
		setColorScheme: (tabId, colorScheme) => electron.ipcRenderer.invoke(PREVIEW_SET_COLOR_SCHEME_CHANNEL, {
			tabId,
			colorScheme
		}),
		openDevTools: (tabId) => electron.ipcRenderer.invoke(PREVIEW_OPEN_DEVTOOLS_CHANNEL, { tabId }),
		clearCookies: () => electron.ipcRenderer.invoke(PREVIEW_CLEAR_COOKIES_CHANNEL),
		clearCache: () => electron.ipcRenderer.invoke(PREVIEW_CLEAR_CACHE_CHANNEL),
		getPreviewConfig: (environmentId) => electron.ipcRenderer.invoke(PREVIEW_GET_CONFIG_CHANNEL, { environmentId }),
		setAnnotationTheme: (theme) => electron.ipcRenderer.invoke(PREVIEW_SET_ANNOTATION_THEME_CHANNEL, { theme }),
		pickElement: (tabId) => electron.ipcRenderer.invoke(PREVIEW_PICK_ELEMENT_CHANNEL, { tabId }),
		cancelPickElement: (tabId) => electron.ipcRenderer.invoke(PREVIEW_CANCEL_PICK_ELEMENT_CHANNEL, { tabId }),
		captureScreenshot: (tabId) => electron.ipcRenderer.invoke(PREVIEW_CAPTURE_SCREENSHOT_CHANNEL, { tabId }),
		revealArtifact: (path) => electron.ipcRenderer.invoke(PREVIEW_REVEAL_ARTIFACT_CHANNEL, { path }),
		copyArtifactToClipboard: (path) => electron.ipcRenderer.invoke(PREVIEW_COPY_ARTIFACT_CHANNEL, { path }),
		pictureInPicture: {
			open: (tabId) => electron.ipcRenderer.invoke(PREVIEW_PICTURE_IN_PICTURE_OPEN_CHANNEL, { tabId }),
			close: (tabId) => electron.ipcRenderer.invoke(PREVIEW_PICTURE_IN_PICTURE_CLOSE_CHANNEL, { tabId })
		},
		recording: {
			startScreencast: (tabId) => electron.ipcRenderer.invoke(PREVIEW_RECORDING_START_CHANNEL, { tabId }),
			stopScreencast: (tabId) => electron.ipcRenderer.invoke(PREVIEW_RECORDING_STOP_CHANNEL, { tabId }),
			save: (tabId, mimeType, data) => electron.ipcRenderer.invoke(PREVIEW_RECORDING_SAVE_CHANNEL, {
				tabId,
				mimeType,
				data
			}),
			onFrame: (listener) => {
				const wrappedListener = (_event, frame) => {
					if (typeof frame !== "object" || frame === null) return;
					listener(frame);
				};
				electron.ipcRenderer.on(PREVIEW_RECORDING_FRAME_CHANNEL, wrappedListener);
				return () => electron.ipcRenderer.removeListener(PREVIEW_RECORDING_FRAME_CHANNEL, wrappedListener);
			}
		},
		automation: {
			status: (tabId) => electron.ipcRenderer.invoke(PREVIEW_AUTOMATION_STATUS_CHANNEL, { tabId }),
			snapshot: (tabId) => electron.ipcRenderer.invoke(PREVIEW_AUTOMATION_SNAPSHOT_CHANNEL, { tabId }),
			click: (tabId, input) => electron.ipcRenderer.invoke(PREVIEW_AUTOMATION_CLICK_CHANNEL, {
				tabId,
				input
			}),
			type: (tabId, input) => electron.ipcRenderer.invoke(PREVIEW_AUTOMATION_TYPE_CHANNEL, {
				tabId,
				input
			}),
			press: (tabId, input) => electron.ipcRenderer.invoke(PREVIEW_AUTOMATION_PRESS_CHANNEL, {
				tabId,
				input
			}),
			scroll: (tabId, input) => electron.ipcRenderer.invoke(PREVIEW_AUTOMATION_SCROLL_CHANNEL, {
				tabId,
				input
			}),
			evaluate: (tabId, input) => electron.ipcRenderer.invoke(PREVIEW_AUTOMATION_EVALUATE_CHANNEL, {
				tabId,
				input
			}),
			waitFor: (tabId, input) => electron.ipcRenderer.invoke(PREVIEW_AUTOMATION_WAIT_FOR_CHANNEL, {
				tabId,
				input
			})
		},
		onStateChange: (listener) => {
			const wrappedListener = (_event, tabId, state) => {
				if (typeof tabId !== "string" || typeof state !== "object" || state === null) return;
				listener(tabId, state);
			};
			electron.ipcRenderer.on(PREVIEW_STATE_CHANGE_CHANNEL, wrappedListener);
			return () => electron.ipcRenderer.removeListener(PREVIEW_STATE_CHANGE_CHANNEL, wrappedListener);
		},
		onPointerEvent: (listener) => {
			const wrappedListener = (_event, pointerEvent) => {
				if (typeof pointerEvent !== "object" || pointerEvent === null) return;
				listener(pointerEvent);
			};
			electron.ipcRenderer.on(PREVIEW_POINTER_EVENT_CHANNEL, wrappedListener);
			return () => electron.ipcRenderer.removeListener(PREVIEW_POINTER_EVENT_CHANNEL, wrappedListener);
		}
	}
});
//#endregion

//# sourceMappingURL=preload.cjs.map