export const env = {
  databaseUrl: process.env.DATABASE_URL ?? '',
  llmApiKey: process.env.LLM_API_KEY ?? '',
};

if (!env.databaseUrl) {
  console.warn('DATABASE_URL is not configured. Prisma will fail to connect until it is set.');
}
