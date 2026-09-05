# kakehashi

架け橋 — *a bridge between two things.*

Use real Svelte 5 components inside React. Not a port: the actual compiled
component is mounted, so its scoped CSS, effects and internal state all behave
exactly as they do in a Svelte app.

```sh
npm i -D @dorsk/kakehashi
```

```jsx
import { toReact } from '@dorsk/kakehashi';
import ButtonSvelte from './Button.svelte';

const Button = toReact(ButtonSvelte, 'Button');

<Button variant="primary" onclick={save}>Save</Button>
```

Props stay reactive — updates mutate the component's props rather than
remounting it — and React children are passed through as the default snippet.

## Named snippets

A React element prop becomes a named snippet. A function prop is treated as an
event handler unless you wrap it in `snippet()`, in which case the Svelte side
can `{@render name(...args)}` and the function receives those arguments.

```jsx
import { snippet, toReact } from '@dorsk/kakehashi';
import TabsSvelte from './Tabs.svelte';

const Tabs = toReact(TabsSvelte, 'Tabs');

<Tabs
  items={['One', 'Two']}
  item={snippet((label, i) => <span>{i + 1}. {label}</span>)}
  panel={<p>Panel content</p>}
/>
```

Which props are snippets is decided when the component mounts.

Your bundler must compile Svelte (`.svelte` and `.svelte.js`).

## Why

Claude Design (claude.ai/design) renders React: its agent builds UI from
components exposed on a global, as JSX. A Svelte design system has nothing to
hand it — so `/design-sync` can only ship the styling layer, and the components
end up hand-mirrored in React, which drifts from the originals immediately.

This bridge closes that gap. Wrap each Svelte export once and the design agent
builds with the real components — same props, same scoped CSS, no second
implementation to keep in sync.

## Not handled yet

`bind:` two-way props, SSR.

## License

MIT
