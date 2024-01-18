export type Project = {
	imageSrc: string;
	slug: string;
	companyName: string;
	year: number;
};

export type SocialLink = {
	name: string;
	url: string;
	ariaLabel: string;
	iconName: string;
};

export type Content = {
	title: string;
	slug: string;
	date: string;
	description: string;
	published: boolean;
	tags?: string[];
};
