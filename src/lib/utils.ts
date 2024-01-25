import type { Content } from './types';

export function debounce(func: (...args: unknown[]) => void, delay: number) {
	let timeout: NodeJS.Timeout;
	return (...args: unknown[]) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), delay);
	};
}

export function isPageScrollable(
	pageHeight: number,
	windowHeight: number,
	offset: number
): boolean {
	return pageHeight > windowHeight + offset;
}

export const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface GetMarkdownContentOptions {
	type: 'bits' | 'posts';
	limit?: number;
	sort?: boolean;
	filter?: (content: Content) => boolean;
}

// TODO combine these functions in a nice way
export async function getBits(options?: GetMarkdownContentOptions): Promise<Content[]> {
	const paths = import.meta.glob<Record<string, any>>('/src/content/bits/*.md', { eager: true });
	const iterableContentFiles = Object.entries(paths);
	let allContent = await Promise.all(
		iterableContentFiles.map(([, resolver]) => {
			const metadata = resolver.metadata;
			const content = resolver.default.render();
			return { ...metadata, content };
		})
	);

	if (options?.sort) {
		allContent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}

	if (options?.filter) {
		allContent = allContent.filter(options.filter);
	}

	return options?.limit ? allContent.slice(0, options?.limit) : allContent;
}

export async function getPosts(options?: GetMarkdownContentOptions): Promise<Content[]> {
	const paths = import.meta.glob<Record<string, any>>('/src/content/posts/*.md', {
		eager: true
	});
	const iterableContentFiles = Object.entries(paths);
	let allContent = await Promise.all(
		iterableContentFiles.map(([, resolver]) => {
			const metadata = resolver.metadata;
			const content = resolver.default.render();
			return { ...metadata, content };
		})
	);

	if (options?.sort) {
		allContent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}

	if (options?.filter) {
		allContent = allContent.filter(options.filter);
	}

	return options?.limit ? allContent.slice(0, options?.limit) : allContent;
}
export interface FormatDateStringOptions {
	monthFormat?: 'long' | 'short';
	dayFormat?: 'number' | 'suffix';
	yearFormat?: 'full' | 'short';
}

export function formatDateString(dateString: string, options?: FormatDateStringOptions): string {
	const date = new Date(dateString);
	date.setDate(date.getDate() + 1); // Fix off by one error
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
