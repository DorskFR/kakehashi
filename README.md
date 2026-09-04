# kakehashi

架け橋 — *a bridge between two things.*

Use real Svelte 5 components inside React. Not a port: the actual compiled
component is mounted, so its scoped CSS, effects and internal state all behave
exactly as they do in a Svelte app.

```sh
npm i -D kakehashi
```

```jsx
import { toReact } from 'kakehashi';
import ButtonSvelte from './Button.svelte';

const Button = toReact(ButtonSvelte, 'Button');

<Button variant="primary" onclick={save}>Save</Button>
```

Props stay reactive — updates mutate the component's props rather than
remounting it — and React children are passed through as the default snippet.

Your bundler must compile Svelte (`.svelte` and `.svelte.js`).

## Not handled yet

Named snippets, `bind:` two-way props, SSR.

## License

MIT
