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

	return `${month} ${day}, '${year}`;
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
