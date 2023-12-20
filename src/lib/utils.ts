import type { Post } from './types';

export async function isPageScrollable(offset: number): Promise<boolean> {
	const pageHeight = document.body.scrollHeight;
	const windowHeight = window.innerHeight;
	return pageHeight > windowHeight + offset;
}

export const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export async function getMarkdownPosts(): Promise<Post[]> {
	const paths = import.meta.glob('/src/posts/*.md', { eager: true });
	const iterablePostFiles = Object.entries(paths);

	const allPosts = await Promise.all(
		iterablePostFiles.map(async ([, resolver]) => {
			const metadata = await resolver.metadata;
			const content = await resolver.default;
			return { ...metadata, content };
		})
	);

	const sortedPosts = allPosts.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);

	return sortedPosts;
}
export interface FormatDateStringOptions {
	monthFormat?: 'long' | 'short';
	dayFormat?: 'number' | 'suffix';
	yearFormat?: 'full' | 'short';
}

export function formatDateString(dateString: string, options?: FormatDateStringOptions): string {
	const date = new Date(dateString);
	const monthFormat = options?.monthFormat || 'short';
	const dayFormat = options?.dayFormat || 'suffix';
	const yearFormat = options?.yearFormat || 'short';

	const month = date.toLocaleString('en-US', { month: monthFormat });
	const day =
		dayFormat === 'number' ? date.getDate() : date.getDate() + getDaySuffix(date.getDate());
	const year =
		yearFormat === 'full' ? date.getFullYear().toString() : date.getFullYear().toString().slice(-2);

	return `${month} ${day}, ${yearFormat === 'full' ? '' : "'"}${year}`;
}

function getDaySuffix(day: number): string {
	if (day >= 11 && day <= 13) {
		return 'th';
	}

	const lastDigit = day % 10;
	switch (lastDigit) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
}
