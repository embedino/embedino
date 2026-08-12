const DIALOG_BACKDROP_CLASS =
  "dialog-backdrop fixed inset-0 z-50";

const DIALOG_POPUP_CLASS =
  "dialog-glass -translate-y-[calc(1.25rem*var(--nested-dialogs))] relative flex min-h-0 w-full min-w-0 scale-[calc(1-0.1*var(--nested-dialogs))] flex-col rounded-2xl border opacity-[calc(1-0.1*var(--nested-dialogs))] outline-none will-change-transform data-nested-dialog-open:origin-top";

const DIALOG_MOBILE_SHEET_CLASS =
  "max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:opacity-[calc(1-min(var(--nested-dialogs),1))]";

export { DIALOG_BACKDROP_CLASS, DIALOG_MOBILE_SHEET_CLASS, DIALOG_POPUP_CLASS };
