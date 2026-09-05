import type { Snippet } from 'svelte';

export declare function createProps<T extends Record<string, unknown>>(initial: T): T;
export declare function createSnippet(
	onSlot: (node: HTMLElement, args: unknown[] | null) => void,
): Snippet<unknown[]>;
