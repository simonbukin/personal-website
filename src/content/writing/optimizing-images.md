---
type: post
date: 2024-01-03
title: '3 days for 3 seconds'
slug: 'optimizing-images'
description: 'An odyssey covering image optimization in a Next.js app'
published: true
tags: ['javascript', 'react', 'nextjs']
---

I'm building out an RSVP website in time for my wedding later this year (woo!). As such, I wanted to have a nice hero image carousel with images from our engagement. I have about ~4 images picked out to start, all JPGs at 5472x3648. The files ranged from about 3MB-10MB (!) in size. I thought this would be easy! How hard can loading images onto a website be?

## The Last Carousel

I was already using `shadcn/ui` for this project, and they had recently rolled out a [`Carousel`](https://ui.shadcn.com/docs/components/carousel) component based on [`Embla`](https://www.embla-carousel.com/), so this choice was pretty easy. After some tweaking, I landed on a configuration like this:

```jsx
const EngagementCarousel = (imageData) => {
	const emblaPlugin = Autoplay({
		delay: 4000
	});

	<Carousel
		className="pointer-events-none order-2 my-4 overflow-clip rounded-none sm:m-0 sm:rounded-2xl"
		opts={{
			loop: true,
			duration: 40,
			speed: 40,
			align: 'center',
			containScroll: false
		}}
		plugins={[emblaPlugin]}
	>
		<CarouselContent>
			{imageData.map((image) => {
				return <CarouselItem key={image.src}>{/* image goes here */}</CarouselItem>;
			})}
		</CarouselContent>
	</Carousel>;
};
```

Note: the `pointer-events-none` is to prevent downloading of the image (at least not easily). If you're a family member, just shoot me an email and I'll send you em' full size. If you're not, don't. That would be **really** weird.

Now we're like 90% there, right? We just have to include an image and this component is all wrapped up. Ha.

## The Phantom `next/image`

Next provides their own `Image` component, so I reached for that first. I loaded all my full- size, 10MB monsters into the `public/` folder and included links to them directly in each `Image` component:

```jsx
<Image
	src="/1.jpg"
	alt="..."
	width={5472}
	height={3648}
	className="rounded-none sm:rounded-2xl"
	sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
	priority={true}
/>
```

There's already a few things wrong here, the first being `sizes` [(docs link)](https://nextjs.org/docs/app/api-reference/components/image). What I **wanted** was for each image to be resized based on the device. So, on mobile, a smaller image would be downloaded than the same image being loaded on desktop. In reality, this component works by downloading appropriate images sizes based on the viewport width. This doesn't help in our case, since the `Carousel` is full width across all screen sizes.

The second issue is `priority`. I didn't yet know how lazy loading worked, so I slapped `priority` on each image in the carousel 🤦. Genius! Next automatically lazy-loads `Images`, so `priority` should really only be on **one** above-the-fold [Largest Contentful Paint](https://web.dev/articles/lcp) element. In my case, the first image in the `Carousel`, but not all of them!

Now, given what I had heard about how nice `next/image` was, I figured I was done here. However, loading up the carousel (with no cache and no throttling on an ethernet connection) caused molasses-like loading of images, line by line. It took over 4 seconds for each individual image to load, and since the `Carousel` scrolled at 4 seconds, sometimes the image wouldn't even be loaded before it shifted to the next one!

## Attack of the File Formats

My first thought was the optimize the images myself. After a round of ChatGPT and a sprinkle of Google, I converted all my images to WebP (which is [purported to be about 25-35% smaller](https://developers.google.com/speed/webp/docs/webp_study)) and tossed them through [compressor.io](https://www.compressor.io). This reduced files sizes a decent amount (~60% across the whole set), but my 10MB behemoth was still about 3MB, which was still way too big. The molasses situation was better, but the loading was still too slow.

I wanted some more manual controls when it came to compression/optimization, so I looked around and found [Squoosh](https://squoosh.app/). I used their defaults, and ended up with about a ~70% reduction in size, but I still wanted more. I fiddled with different file formats, specifically JpegXL (which `next/image` doesn't support 😭) and AVIF, as well as the "quality" setting, but still encountered the same image loading issues as before.

At this point, my wonderful fiancée requested a different set of images for the carousel, so I had to reoptimize the new set manually. At this point, I realized a couple things:

- futzing with image optimization manually with my current level of understanding was an exercise in frustration and guesswork all at the same time.
- I felt that my time could be better spent, you know, developing the rest of the app.

Fortunately, there did exist a solution. It was CDN time.

## Cloudinary: A New Hope

I reached for [Cloudinary](https://cloudinary.com/), as I'd heard only good things about their free tier, and I only needed ~4-10 images. I figured I could use the CDN for auto-resizing and serving optimized images, so I kept on using the `next/image` component, with the `src` set to the public Cloudinary image links.

The good: the file sizes were a lot better, both between mobile and desktop. The 10MB behemoth seemed to have been tamed, and clocked in at around ~950kb on desktop, and ~600kb on mobile.

The bad: the `Image` component was still causing problems, and loading was still taking about 2-3 seconds, which was not ideal for a hero image.

## The `next/image` Strikes Back

I scrounged around Cloudinary's docs and found that they have their own `next/image` wrapper, [`CldImage`](https://next.cloudinary.dev/cldimage/basic-usage). At this point I should have guessed that this would still have issues, but I was still clinging desperately to the Next ecosystem. Here's what the `CldImage` implementation looked like:

```jsx
<CldImage src={path} alt={alt} width={width} height={height} priority={priority} />
```

This was more or less a drop-in replacement for `Image`, and worked... ok. The initial loads were faster, but the scrolling of the `Carousel` had issues with image pop-in, which didn't feel great. I delved back into GitHub in hopes of a better solution.

Note: there was a bit of a rabbit hole associated with `next/image`, as shown [by](https://stackoverflow.com/questions/66637391/next-images-components-are-too-slow-to-appear) ... [these](https://github.com/vercel/next.js/discussions/21294) ... [threads](https://www.reddit.com/r/nextjs/comments/10w0r10/nextimage_loading_slow/). `sharp` vs `squoosh`, "just use `<img>`", changing available file formats, the list goes on. This, as well as the issues I was having above, are what pushed me to looking for other options.

## The unpic Awakens

[unpic-img](https://github.com/ascorbic/unpic-img) appeared, like a phoenix from the ashes of my previous, failed image optimization attempts. A "multi-framework responsive image component" sounded perfect, since it wouldn't be tied to `next/image`, but also would be (hopefully) less imperative than writing my own `<img>` implementation. unpic also had native support for Cloudinary, which gave me even more confidence that I had found a reasonable solution.
Here's what the unpic `Image` component looked like:

```jsx
<Image
	src="https://res.cloudinary.com..."
	alt={alt}
	aspectRatio={3 / 2}
	background="transparent"
	layout="fullWidth"
	priority={true}
/>
```

And just like that, the `Carousel` images loaded within about ~500ms of page load, and subsequent image scrolling didn't have any pop-in or loading weirdness. Checking the Network tab also revealed that unpic somehow convinced Cloudinary to downsize my images even more, resulting in a maximum image download of ~200kb (I have a feeling that correctly using Cloudinary accounted for much of the optimization here, and could have been accomplished without unpic, but I appreciate them regardless).

Another nicety here was not even having the include a hardcoded `width` and `height`, and only needing an `aspectRatio`. I'm not sure if this was possible with `CldImage` or `next/image`, but I'm glad it worked with unpic.

And thus ends the saga of optimizing images for my wedding website. I would love to say that they're done forever, but knowing me, I'll have updates for this article when I inevitably find a more efficient solution for making my image loads even faster.

Check out [the source here](https://github.com/simonbukin/wedding-website/commits/main/src/components/EngagementCarousel.tsx)
