export type Project = {
	imageSrc: string;
	slug: string;
	companyName: string;
	year: number;
};

export type SocialLink = {
	name: string;
	url: string;
	iconName: string;
};

export type Post = {
	title: string;
	slug: string;
	date: string;
	tags?: string[];
};
