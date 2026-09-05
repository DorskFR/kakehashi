import type { ComponentType, ReactNode } from 'react';
import { createElement, isValidElement, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Component } from 'svelte';
import { mount, unmount } from 'svelte';
import { createProps, createSnippet } from './props.svelte.js';

type AnyProps = Record<string, unknown>;
type SnippetFn = (...args: never[]) => ReactNode;
type Slot = { key: string; args: unknown[] };

const snippetFns = new WeakSet<object>();
const slotIds = new WeakMap<HTMLElement, number>();
let nextSlotId = 0;

function slotId(node: HTMLElement): number {
	let id = slotIds.get(node);
	if (id === undefined) {
		id = nextSlotId++;
		slotIds.set(node, id);
	}
	return id;
}

/**
 * Mark a function prop as a snippet rather than an event handler. The Svelte
 * component renders it with `{@render name(...args)}` and the function receives
 * those arguments.
 */
export function snippet<A extends unknown[]>(
	fn: (...args: A) => ReactNode,
): (...args: A) => ReactNode {
	snippetFns.add(fn);
	return fn;
}

function isSnippetProp(key: string, value: unknown): boolean {
	if (key === 'children') return value !== undefined;
	if (isValidElement(value)) return true;
	return typeof value === 'function' && snippetFns.has(value);
}

function resolve(value: unknown, args: unknown[]): ReactNode {
	if (typeof value === 'function' && snippetFns.has(value))
		return (value as SnippetFn)(...(args as never[]));
	return value as ReactNode;
}

/**
 * Wrap a Svelte 5 component as a React one.
 *
 * The real compiled component is mounted — its scoped CSS, effects and
 * transitions all behave as they do in a Svelte app. Props stay reactive
 * (updates mutate the same `$state` object rather than remounting).
 *
 * React children become the default snippet. A React element prop becomes a
 * named snippet, as does a function wrapped in `snippet()`. Which props are
 * snippets is decided at mount.
 *
 * Not handled yet: `bind:` two-way props and SSR.
 */
export function toReact<P extends AnyProps = AnyProps>(
	SvelteComponent: Component<never> | unknown,
	displayName?: string,
): ComponentType<P & { children?: ReactNode }> {
	function Bridge(props: P & { children?: ReactNode }) {
		const hostRef = useRef<HTMLSpanElement | null>(null);
		const stateRef = useRef<AnyProps | null>(null);
		const snippetKeys = useRef<Set<string>>(new Set());
		const [slots, setSlots] = useState<Map<HTMLElement, Slot>>(new Map());

		// biome-ignore lint/correctness/useExhaustiveDependencies: mount once; props sync below.
		useEffect(() => {
			const target = hostRef.current;
			if (!target) return;

			const initial: AnyProps = {};
			for (const [key, value] of Object.entries(props as AnyProps)) {
				if (!isSnippetProp(key, value)) {
					initial[key] = value;
					continue;
				}
				snippetKeys.current.add(key);
				initial[key] = createSnippet((node, args) => {
					setSlots((prev) => {
						const next = new Map(prev);
						if (args === null) next.delete(node);
						else next.set(node, { key, args });
						return next;
					});
				});
			}

			const reactive = createProps<AnyProps>(initial);
			stateRef.current = reactive;

			// biome-ignore lint/suspicious/noExplicitAny: Svelte's mount signature is generic over the component.
			const instance = mount(SvelteComponent as any, { target, props: reactive as any });

			return () => {
				unmount(instance);
				stateRef.current = null;
				snippetKeys.current.clear();
				setSlots(new Map());
			};
		}, []);

		useEffect(() => {
			const reactive = stateRef.current;
			if (!reactive) return;
			for (const [key, value] of Object.entries(props as AnyProps)) {
				if (snippetKeys.current.has(key)) continue;
				if (reactive[key] !== value) reactive[key] = value;
			}
		});

		const portals: ReactNode[] = [];
		for (const [node, { key, args }] of slots) {
			const content = resolve((props as AnyProps)[key], args);
			if (content != null) portals.push(createPortal(content, node, String(slotId(node))));
		}

		return createElement('span', { ref: hostRef, style: { display: 'contents' } }, ...portals);
	}

	Bridge.displayName = displayName ?? 'SvelteBridge';
	return Bridge as ComponentType<P & { children?: ReactNode }>;
}
