import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    company: z.string(),
    role: z.string(),
    period: z.string(),
    summary: z.string(),
    metric: z.string().optional(),
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work };
