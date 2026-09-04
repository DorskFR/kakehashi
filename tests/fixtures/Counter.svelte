<script>
	let { start = 0 } = $props();
	let n = $state(0);
	const total = $derived(start + n);
</script>

<button data-testid="counter" onclick={() => n++}>{total}</button>
