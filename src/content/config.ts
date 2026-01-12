import { defineCollection, z } from 'astro:content';

const baseWriting = {
  title: z.string(),
  date: z.coerce.date(),
  description: z.string(),
  published: z.boolean().default(true),
  slug: z.string().optional(),
};

const writing = defineCollection({
  type: 'content',
  schema: z.discriminatedUnion('type', [
    z.object({
      ...baseWriting,
      type: z.literal('post'),
      tags: z.array(z.string()).optional(),
    }),
    z.object({
      ...baseWriting,
      type: z.literal('bit'),
    }),
    z.object({
      ...baseWriting,
      type: z.literal('portfolio'),
      tags: z.array(z.string()).optional(),
      company: z.string(),
      role: z.string(),
      timeline: z.string(),
      launch: z.string(),
    }),
  ]),
});

const media = defineCollection({
  type: 'content',
  schema: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('movie'),
      title: z.string(),
      date: z.coerce.date(),
      rating: z.number().optional(),
      year: z.number().optional(),
    }),
    z.object({
      type: z.literal('show'),
      title: z.string(),
      date: z.coerce.date(),
      rating: z.number().optional(),
      season: z.number().optional(),
    }),
    z.object({
      type: z.literal('game'),
      title: z.string(),
      date: z.coerce.date(),
      rating: z.number().optional(),
      platform: z.string().optional(),
    }),
    z.object({
      type: z.literal('music'),
      title: z.string(),
      date: z.coerce.date(),
      rating: z.number().optional(),
      artist: z.string(),
    }),
  ]),
});

const resume = defineCollection({
  type: 'content',
  schema: z.discriminatedUnion('section', [
    z.object({
      section: z.literal('summary'),
      order: z.number().default(0),
    }),
    z.object({
      section: z.literal('experience'),
      id: z.string(),
      company: z.string(),
      companyUrl: z.string().url().optional(),
      companyNote: z.string().optional(),
      title: z.string(),
      location: z.string(),
      dates: z.string(),
      order: z.number(),
      caseStudy: z.string().optional(),
    }),
    z.object({
      section: z.literal('volunteer'),
      id: z.string(),
      company: z.string(),
      companyUrl: z.string().url().optional(),
      title: z.string(),
      location: z.string(),
      dates: z.string(),
      order: z.number(),
      caseStudy: z.string().optional(),
    }),
    z.object({
      section: z.literal('education'),
      id: z.string(),
      institution: z.string(),
      degree: z.string(),
      dates: z.string(),
      order: z.number(),
    }),
  ]),
});

const about = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});

const baseTimeline = {
  title: z.string(),
  date: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  description: z.string().optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  links: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })).optional(),
};

const timeline = defineCollection({
  type: 'content',
  schema: z.discriminatedUnion('type', [
    z.object({
      ...baseTimeline,
      type: z.literal('personal'),
      repo: z.string().optional(),
      tech: z.array(z.string()).optional(),
    }),
    z.object({
      ...baseTimeline,
      type: z.literal('class'),
      course: z.string(),
      institution: z.string(),
    }),
    z.object({
      ...baseTimeline,
      type: z.literal('work'),
      company: z.string(),
      role: z.string().optional(),
    }),
  ]),
});

export const collections = { writing, media, resume, about, timeline };
