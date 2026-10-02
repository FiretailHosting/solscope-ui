/** The custom property on `<html>` that holds the stack's height, in px. */
export declare const toastStackHeightProperty = "--toast-stack-height";
/** Adds a mounted toast to the stack and returns the function that removes it. */
export declare function stackToast(toast: HTMLElement): () => void;
