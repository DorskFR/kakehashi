<script>
	let { name = 'world', tone = 'plain', children, onclick } = $props();
</script>

<p class="greet {tone}" data-testid="greet" {onclick}>
	Hello {name}{#if children}, {@render children()}{/if}
</p>

<style>
	.greet { color: rebeccapurple; }
	.loud { font-weight: 700; }
</style>
