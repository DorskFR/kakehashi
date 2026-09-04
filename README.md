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

Named snippets, `bind:` two-way props, SSR.

## License

MIT
