import type { ComponentType, ReactNode } from 'react';
import { createElement, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Component } from 'svelte';
import { createRawSnippet, mount, unmount } from 'svelte';
import { createProps } from './props.svelte.js';

type AnyProps = Record<string, unknown>;

/**
 * Wrap a Svelte 5 component as a React one.
 *
 * The real compiled component is mounted — its scoped CSS, effects and
 * transitions all behave as they do in a Svelte app. Props stay reactive
 * (updates mutate the same `$state` object rather than remounting), and React
 * children are handed through as the component's default snippet.
 *
 * Not handled yet: named snippets, `bind:` two-way props, and SSR.
 */
export function toReact<P extends AnyProps = AnyProps>(
	SvelteComponent: Component<never> | unknown,
	displayName?: string,
): ComponentType<P & { children?: ReactNode }> {
	function Bridge({ children, ...props }: P & { children?: ReactNode }) {
		const hostRef = useRef<HTMLSpanElement | null>(null);
		const stateRef = useRef<AnyProps | null>(null);
		const [slot, setSlot] = useState<HTMLElement | null>(null);

		// biome-ignore lint/correctness/useExhaustiveDependencies: mount once; props sync below.
		useEffect(() => {
			const target = hostRef.current;
			if (!target) return;

			const childrenSnippet =
				children === undefined
					? undefined
					: createRawSnippet(() => ({
							render: () => '<span style="display:contents"></span>',
							setup: (node: Element) => {
								queueMicrotask(() => setSlot(node as HTMLElement));
							},
						}));

			const reactive = createProps<AnyProps>({
				...(props as AnyProps),
				...(childrenSnippet ? { children: childrenSnippet } : {}),
			});
			stateRef.current = reactive;

			// biome-ignore lint/suspicious/noExplicitAny: Svelte's mount signature is generic over the component.
			const instance = mount(SvelteComponent as any, { target, props: reactive as any });

			return () => {
				unmount(instance);
				stateRef.current = null;
				setSlot(null);
			};
		}, []);

		// Prop updates mutate the same reactive object — no remount.
		useEffect(() => {
			const reactive = stateRef.current;
			if (!reactive) return;
			for (const [key, value] of Object.entries(props as AnyProps)) {
				if (reactive[key] !== value) reactive[key] = value;
			}
		});

		return createElement(
			'span',
			{ ref: hostRef, style: { display: 'contents' } },
			slot && children != null ? createPortal(children, slot) : null,
		);
	}

	Bridge.displayName = displayName ?? 'SvelteBridge';
	return Bridge as ComponentType<P & { children?: ReactNode }>;
}
