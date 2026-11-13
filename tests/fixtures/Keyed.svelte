<script lang="ts">
	let { items, key }: { items: string[]; key: (item: string) => string } = $props();
</script>

<ul data-testid="keyed">
	{#each items as item (key(item))}
		<li>{key(item)}</li>
	{/each}
</ul>
