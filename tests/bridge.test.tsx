import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { toReact } from '../src/index.js';
import Counter from './fixtures/Counter.svelte';
import Greeting from './fixtures/Greeting.svelte';

declare global {
	// eslint-disable-next-line no-var
	var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const Hello = toReact<{ name?: string; tone?: string }>(Greeting, 'Greeting');
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
