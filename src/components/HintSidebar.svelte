<script>
	import { hintPanel } from '@sudoku/stores/hintPanel';

	$: moveLabel = $hintPanel.move
		? `R${$hintPanel.move.y + 1} C${$hintPanel.move.x + 1}`
		: null;
</script>

<aside class="hint-sidebar">
	<div class="hint-sidebar__card">
		<div class="hint-sidebar__header">
			<h2 class="hint-sidebar__title">{$hintPanel.title}</h2>
			{#if $hintPanel.visible}
				<button class="hint-sidebar__clear" on:click={hintPanel.clear}>
					Clear
				</button>
			{/if}
		</div>

		<p class="hint-sidebar__text">{$hintPanel.description}</p>

		{#if moveLabel}
			<div class="hint-sidebar__meta">
				<span class="hint-sidebar__meta-label">Cell</span>
				<span class="hint-sidebar__meta-value">{moveLabel}</span>
			</div>
		{/if}

		{#if $hintPanel.kind === 'next-step' && $hintPanel.value !== null}
			<div class="hint-sidebar__meta">
				<span class="hint-sidebar__meta-label">Value</span>
				<span class="hint-sidebar__meta-value">{$hintPanel.value}</span>
			</div>
		{/if}

		{#if $hintPanel.kind === 'select' && $hintPanel.items.length > 0}
			<div class="hint-sidebar__chips">
				{#each $hintPanel.items as candidate}
					<span class="hint-sidebar__chip">{candidate}</span>
				{/each}
			</div>
		{/if}
	</div>
</aside>

<style>
	.hint-sidebar {
		padding: 0 1rem 1rem;
	}

	.hint-sidebar__card {
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid rgba(203, 213, 225, 0.9);
		border-radius: 18px;
		box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
		padding: 1rem;
	}

	.hint-sidebar__header {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.hint-sidebar__title {
		color: #1f2937;
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: 0.04em;
	}

	.hint-sidebar__clear {
		background: transparent;
		border: 0;
		color: #2979fa;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.hint-sidebar__text {
		color: #4b5563;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.hint-sidebar__meta {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin-top: 0.85rem;
	}

	.hint-sidebar__meta-label {
		color: #6b7280;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.hint-sidebar__meta-value {
		color: #111827;
		font-size: 0.95rem;
		font-weight: 700;
	}

	.hint-sidebar__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.hint-sidebar__chip {
		align-items: center;
		background: #2979fa;
		border-radius: 9999px;
		color: #fff;
		display: inline-flex;
		font-size: 0.875rem;
		font-weight: 700;
		justify-content: center;
		min-width: 2rem;
		padding: 0.35rem 0.7rem;
	}

	@media (min-width: 1200px) {
		.hint-sidebar {
			padding: 0;
			position: fixed;
			right: 1.5rem;
			top: 6.5rem;
			width: 18rem;
			z-index: 15;
		}

		.hint-sidebar__card {
			max-height: calc(100vh - 8rem);
			overflow: auto;
		}
	}
</style>