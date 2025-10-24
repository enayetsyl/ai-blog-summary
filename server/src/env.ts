import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  GEMINI_API_KEY: z.string().min(1),
  ADMIN_TOKEN: z.string().min(1).optional(),
  PORT: z.string().optional(),
  TZ: z.string().default('Asia/Dhaka'),
  API_BASE_URL: z.string().url().optional()
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  PORT: process.env.PORT,
  TZ: process.env.TZ ?? 'Asia/Dhaka',
  API_BASE_URL: process.env.API_BASE_URL
});
