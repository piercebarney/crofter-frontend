import { writable } from 'svelte/store'
import { setGet } from 'src/stores/helpers'



// Removed locations property, moved to separate locations store
export type Layout = {
	size:			string
	sizes:			Record<string,number>
	width:			number
	scroll:			{
			position:	number
			up:			boolean
			down:		boolean
			reverse:	number
			element:	HTMLDivElement|null
			isSmooth:	boolean
		}
	device:			'mobile'|'tablet'|'desktop'
	mobile:			string
	tablet:			string
	desktop:		string
	isMobile:		boolean
	isTablet:		boolean
	isDesktop:		boolean
	isNotMobile:	boolean
	isNotTablet:	boolean
	isNotDesktop:	boolean
	overlay:		string|null
	header:			{
			mainHeight:			number
			searchHeight:		number
			heightWithSearch:	number
			heightWithoutMain:	number

		}
}


const sizes: Record<string,number> = {
	min	: 288,
	xs	: 480,
	sm	: 576,
	md	: 768,
	lg	: 1024,
	xl	: 1280,
	xxl	: 1536
}

// Initialize with consistent values for SSR/client hydration
// Default to mobile-first approach to prevent hydration mismatch
const values: Layout = {
	size			: 'xs',
	sizes			: sizes,
	width			: 0,
	scroll			: {
			position:	0,
			up:			false,
			down:		false,
			reverse:	0,
			element:	null,
			isSmooth:	false
		},
	device			: 'mobile',
	mobile			: 'md',
	tablet			: 'md',
	desktop			: 'lg',
	// Always start with mobile=true for consistent SSR/client initial render
	isMobile		: true,
	isTablet		: false,
	isDesktop		: false,
	isNotMobile		: false,
	isNotTablet		: true,
	isNotDesktop	: true,
	overlay			: null,
	header			: {
			mainHeight			: 0,
			searchHeight		: 0,
			heightWithSearch	: 0,
			heightWithoutMain	: 0
		}
}

const { subscribe, update } = writable(values)


let currentDirection: 'up'|'down'|null = null

const createLayoutStore = () : any => {
	
	
	const store = { subscribe, ...setGet(subscribe, update),

		setScrollElement : (element:HTMLDivElement) => update((v:Layout) => { v.scroll.element = element; return v }),

		setScroll : (_e: Event) => update((v:Layout) => {

			const scrollElement = v.scroll.element

			if (!scrollElement) return v
			
			const scroll = scrollElement.scrollTop

			if (!v.scroll.up && scroll > v.scroll.position) {
				
				v.scroll.up			= true
				v.scroll.down		= false
				v.scroll.reverse	= v.scroll.position
			
			} else if (!v.scroll.down && scroll < v.scroll.position) {
				
				v.scroll.up			= false
				v.scroll.down		= true
				v.scroll.reverse	= v.scroll.position
			}
			
			v.scroll.position = scroll
			
			if (v.scroll.isSmooth) {

				const direction = v.scroll.down ? 'down' : 'up'
				
				if (currentDirection && currentDirection != direction) {

					scrollElement.scrollTo({ top: scrollElement.scrollTop, behavior: 'auto' })

					v.scroll.isSmooth = false

					currentDirection = null
				}

				currentDirection = direction

			} else currentDirection = null
			
			return v
		}),

		setWidth : (width:number) => update((v:Layout) => {

			v.width = width

			if		(width >= sizes.xxl)	v.size = 'xxl'
			else if	(width >= sizes.xl)		v.size = 'xl'
			else if	(width >= sizes.lg)		v.size = 'lg'
			else if	(width >= sizes.md)		v.size = 'md'
			else if	(width >= sizes.sm)		v.size = 'sm'
			else if	(width >= sizes.xs)		v.size = 'xs'
			else							v.size = 'min'

			if		(width < v.sizes[v.mobile])		v.device = 'mobile'
			else if	(width < v.sizes[v.desktop])	v.device = 'tablet'
			else									v.device = 'desktop'

			v.isMobile	= v.device == 'mobile'
			v.isTablet	= v.device == 'tablet'
			v.isDesktop	= v.device == 'desktop'

			v.isNotMobile	= v.device != 'mobile'
			v.isNotTablet	= v.device != 'tablet'
			v.isNotDesktop	= v.device != 'desktop'
			
			return v
		}),

		scroll : (top:number = 0, behavior:ScrollBehavior|undefined) => {

			if (layout.get('scroll').position == top) return

			if (behavior == 'smooth') update((v:Layout) => { v.scroll.isSmooth = true; return v })
		
			const scrollElement = layout.get('scroll').element

			scrollElement?.scrollTo({top, behavior})
		
			if (behavior == 'smooth') {

				let scrollTimeout: number | null = null
				
				const scrollHandler = () => {
					
					if (scrollTimeout !== null) clearTimeout(scrollTimeout)
					
					scrollTimeout = setTimeout(() => {

						update((v:Layout) => { v.scroll.isSmooth = false; return v })

						scrollElement.removeEventListener('scroll', scrollHandler)

						currentDirection = null

					}, 100) as unknown as number
				}

				scrollElement?.addEventListener('scroll', scrollHandler)
			}
		},

		stopScroll : () => {

			const scrollElement = layout.get('scroll').element

			if (scrollElement) {

				scrollElement.scrollTo({ top: scrollElement.scrollTop, behavior: 'auto' })

				update((v:Layout) => { v.scroll.isSmooth = false; return v })
			}
		},

		compare : (width:number, operator:string, size:string): boolean => {

			const sizes = layout.get('sizes')

			switch (operator) {

				case '<'	: return width < sizes[size]
				case '<='	: return width <= sizes[size]
				case '>'	: return width > sizes[size]
				case '>='	: return width >= sizes[size]
			}

			return false
		},

		closeMenu : () => update((v:Layout) => { v.overlay = null; return v })
	}

	return store
}

export const layout = createLayoutStore()