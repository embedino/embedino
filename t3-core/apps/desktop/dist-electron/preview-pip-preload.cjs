let electron = require("electron");
//#region src/ipc/channels.ts
const PREVIEW_PICTURE_IN_PICTURE_FRAME_CHANNEL = "desktop:preview-pip-frame";
//#endregion
//#region src/preview-pip-preload.ts
electron.contextBridge.exposeInMainWorld("previewPictureInPicture", { onFrame: (listener) => {
	const wrappedListener = (_event, frame) => {
		if (typeof frame !== "object" || frame === null) return;
		listener(frame);
	};
	electron.ipcRenderer.on(PREVIEW_PICTURE_IN_PICTURE_FRAME_CHANNEL, wrappedListener);
	return () => electron.ipcRenderer.removeListener(PREVIEW_PICTURE_IN_PICTURE_FRAME_CHANNEL, wrappedListener);
} });
//#endregion

//# sourceMappingURL=preview-pip-preload.cjs.map