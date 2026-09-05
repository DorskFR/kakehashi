import { createRawSnippet } from 'svelte';

/**
 * Runes only work in a file the Svelte compiler processes, so this module
 * stays `.svelte.js` and is shipped uncompiled.
 */
export function createProps(initial) {
	const props = $state({ ...initial });
	return props;
}

/**
 * A snippet whose every rendered instance reports its host node and current
 * arguments through `onSlot`; `args === null` means the instance was removed.
 */
export function createSnippet(onSlot) {
	return createRawSnippet((...getters) => ({
		render: () => '<span style="display:contents"></span>',
		setup(node) {
			$effect(() => {
				onSlot(
					node,
					getters.map((get) => get()),
				);
			});
			return () => onSlot(node, null);
		},
	}));
}
