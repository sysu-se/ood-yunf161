<script>
	export let data = {};
	export let hideModal;

	function handleAccept() {
		if (data.onAccept) data.onAccept();
		hideModal();
	}

	function handleReject() {
		if (data.onReject) data.onReject();
		hideModal();
	}
</script>

<h1 class="text-3xl font-semibold mb-5 leading-none">{data.title || '结束探索模式'}</h1>

{#if data.text}
	<p class="text-lg mb-5">{data.text}</p>
{/if}

<div class="flex justify-end flex-wrap gap-3">
	<button class="btn btn-small" on:click={hideModal}>继续探索</button>
	<button class="btn btn-small" on:click={handleReject}>{data.rejectButton || '放弃本次探索'}</button>
	<button class="btn btn-small btn-primary" on:click={handleAccept}>{data.acceptButton || '接受当前结果'}</button>
</div>