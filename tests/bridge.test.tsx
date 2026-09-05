import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { snippet, toReact } from '../src/index.js';
import Counter from './fixtures/Counter.svelte';
import Greeting from './fixtures/Greeting.svelte';
import Tabs from './fixtures/Tabs.svelte';

declare global {
	// eslint-disable-next-line no-var
	var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const Hello = toReact<{ name?: string; tone?: string; onclick?: () => void }>(Greeting, 'Greeting');
const Count = toReact<{ start?: number }>(Counter, 'Counter');

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
	globalThis.IS_REACT_ACT_ENVIRONMENT = true;
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
});

afterEach(async () => {
	await act(async () => root.unmount());
	host.remove();
});

const el = () => host.querySelector('[data-testid="greet"]');

describe('toReact', () => {
	it('mounts the real Svelte component', async () => {
		await act(async () => root.render(<Hello name="Dorsk" />));
		expect(el()?.textContent).toContain('Hello Dorsk');
	});

	it('keeps the component scoped-CSS class', async () => {
		await act(async () => root.render(<Hello />));
		expect(el()?.className).toMatch(/svelte-/);
	});

	it('passes React children through as the default snippet', async () => {
		await act(async () => root.render(<Hello name="Dorsk">good morning</Hello>));
		expect(el()?.textContent).toContain('good morning');
	});

	it('updates props reactively without remounting', async () => {
		await act(async () => root.render(<Hello name="one" />));
		const before = el();
		await act(async () => root.render(<Hello name="two" />));
		expect(el()).toBe(before);
		expect(el()?.textContent).toContain('Hello two');
	});

	it('applies changed prop values to the class list', async () => {
		await act(async () => root.render(<Hello tone="plain" />));
		await act(async () => root.render(<Hello tone="loud" />));
		expect(el()?.className).toContain('loud');
	});

	it('keeps the component internal state across prop updates', async () => {
		await act(async () => root.render(<Count start={0} />));
		const btn = () => host.querySelector('[data-testid="counter"]') as HTMLButtonElement;
		await act(async () => btn().click());
		expect(btn().textContent).toBe('1');
		await act(async () => root.render(<Count start={10} />));
		expect(btn().textContent).toBe('11');
	});

	it('unmounts cleanly', async () => {
		await act(async () => root.render(<Hello />));
		await act(async () => root.unmount());
		expect(host.querySelector('[data-testid="greet"]')).toBeNull();
		root = createRoot(host);
	});
});

const Tabbed = toReact<{
	items: string[];
	panel?: ReactNode;
	item: (entry: string, i: number) => ReactNode;
}>(Tabs, 'Tabs');

describe('named snippets', () => {
	const tabs = () =>
		Array.from(host.querySelectorAll('[data-testid="tab"]')).map((t) => t.textContent);
	const panel = () => host.querySelector('[data-testid="panel"]');

	it('renders a React element prop as a named snippet', async () => {
		await act(async () =>
			root.render(
				<Tabbed items={[]} item={snippet(() => null)} panel={<b data-testid="content">body</b>} />,
			),
		);
		expect(panel()?.querySelector('[data-testid="content"]')?.textContent).toBe('body');
	});

	it('passes snippet arguments to a marked function prop', async () => {
		await act(async () =>
			root.render(
				<Tabbed items={['a', 'b']} item={snippet((entry: string, i: number) => `${i}:${entry}`)} />,
			),
		);
		expect(tabs()).toEqual(['0:a', '1:b']);
		expect(panel()).toBeNull();
	});

	it('re-renders snippet content when props change without remounting', async () => {
		const item = snippet((entry: string) => entry);
		await act(async () => root.render(<Tabbed items={['a']} item={item} panel={<i>one</i>} />));
		const before = host.querySelector('[data-testid="tabs"]');
		await act(async () =>
			root.render(<Tabbed items={['a', 'b']} item={item} panel={<i>two</i>} />),
		);
		expect(host.querySelector('[data-testid="tabs"]')).toBe(before);
		expect(tabs()).toEqual(['a', 'b']);
		expect(panel()?.textContent).toBe('two');
		await act(async () => root.render(<Tabbed items={['b']} item={item} panel={<i>two</i>} />));
		expect(tabs()).toEqual(['b']);
	});

	it('keeps plain function props as event handlers', async () => {
		let clicks = 0;
		await act(async () => root.render(<Hello name="x" onclick={() => clicks++} />));
		await act(async () => (el() as HTMLElement).click());
		expect(clicks).toBe(1);
	});
});
