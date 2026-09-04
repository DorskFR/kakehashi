/**
 * Reactive prop holder. Runes only work in a file the Svelte compiler processes,
 * so this stays a `.svelte.js` module and is shipped uncompiled.
 */
export function createProps(initial) {
	const props = $state({ ...initial });
	return props;
}
