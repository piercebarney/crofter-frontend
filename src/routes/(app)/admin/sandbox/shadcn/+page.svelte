<script lang="ts">
	// import ShadcnWrapper from '$lib/components/shadcn-wrapper.svelte'
	import { Button } from '$lib/components/ui/button'
</script>

<div class="p-8 bg-slate-50 min-h-screen">
	<div class="bg-red-500 text-white p-4 mb-4 rounded">
		TEST: If you see red background, Tailwind is working!
	</div>
	
	<div class="bg-primary text-primary-foreground p-4 mb-4 rounded">
		TEST 2: If you see a dark background here, the theme variables are working!
	</div>
	
	<h1 class="text-3xl font-bold mb-6">shadcn-svelte Components</h1>
	
	<div class="space-y-8">
		<div>
			<h2 class="text-xl font-semibold mb-4">Button Variants</h2>
			<div class="flex flex-wrap gap-2">
				<Button>Default</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="destructive">Destructive</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="link">Link</Button>
			</div>
		</div>
		
		<div>
			<h2 class="text-xl font-semibold mb-4">Button Sizes</h2>
			<div class="flex flex-wrap gap-2 items-center">
				<Button size="sm">Small</Button>
				<Button size="default">Default</Button>
				<Button size="lg">Large</Button>
				<Button size="icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
				</Button>
			</div>
		</div>

		<div>
			<h2 class="text-xl font-semibold mb-4">Sandbox</h2>
			<div class="flex flex-wrap gap-2 items-center">
				<Button route="home">Default</Button>
			</div>
		</div>
	</div>
</div>