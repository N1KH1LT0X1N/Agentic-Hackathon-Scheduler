interface LLMContext {
  [key: string]: unknown;
}

export async function callLLM(prompt: string, context: LLMContext) {
  const summaryPieces = Object.keys(context)
    .map((key) => `${key}: ${JSON.stringify(context[key]).slice(0, 120)}`)
    .join('\n');
  return {
    content: `Hackathon Copilot response based on prompt: ${prompt.slice(0, 160)}\nContext:\n${summaryPieces}`,
  };
}
