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

export const collections = { writing, media };
