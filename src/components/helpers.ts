let observer: IntersectionObserver

function getObserver() {

    if (observer) return

    observer = new IntersectionObserver(

        (entries: IntersectionObserverEntry[]) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) entry.target.dispatchEvent(new CustomEvent('isVisible'))
            })
        }
    )
}

export const lazyLoad = (element:any) => {

	getObserver()

	observer.observe(element)

	return {

		destroy() {

			observer.unobserve(element)
		}
	}
}

export const imageLoad = (element:any) => {

	const handler = () => {

		element.dispatchEvent(new CustomEvent('imageLoaded'))
	}

	element.addEventListener('load', handler)

	return {

		destroy() {

			element.removeEventListener('load', handler)
		}
	}
}

export const clickOutside = (element:any) => {

	const hadnler = (event:any) => {

		if (!element.contains(event.target)) element.dispatchEvent(new CustomEvent('outClick'))
	}

	document.addEventListener('click', hadnler, true)

	return {

		destroy() {

			document.removeEventListener('click', hadnler, true)
		}
	}
}

export const formatTitle = (title:string) : string => {

	return title // dissabled until able to fix

	// title = title.replaceAll('-', ' ')

	// const words = ['a','and','as','at','but','by','down','for','from','if','in','into','like','near','nor','of','off','on','once','onto','or','over','past','so','than','that','to','upon','when','with','yet']
	// const parts = title.toLocaleLowerCase().split(' ')

	// let result: string[] = []

	// parts.forEach((part, index) => {

	// 	if (words.includes(part) && index != 0) result.push(part)
	// 	else result.push(part.charAt(0).toUpperCase() + part.slice(1))
	// })

	// return result.join(' ')
}

export const formatPrice = (price:string) : string => !isNaN(parseFloat(price)) ? parseFloat(price).toFixed(2) : ''