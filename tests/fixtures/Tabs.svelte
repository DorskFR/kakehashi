<script>
	let { items = [], panel, item } = $props();
</script>

<div data-testid="tabs">
	<ul>
		{#each items as entry, i}
			<li data-testid="tab">{@render item(entry, i)}</li>
		{/each}
	</ul>
	{#if panel}<section data-testid="panel">{@render panel()}</section>{/if}
</div>
