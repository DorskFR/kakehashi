<script>
	let { name = 'world', tone = 'plain', children } = $props();
</script>

<p class="greet {tone}" data-testid="greet">
	Hello {name}{#if children}, {@render children()}{/if}
</p>

<style>
	.greet { color: rebeccapurple; }
	.loud { font-weight: 700; }
</style>
