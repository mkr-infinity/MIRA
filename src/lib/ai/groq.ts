import { createOpenAiCompatibleAdapter } from "./openaiCompatible";

const GROQ_DEFAULT = "https://api.groq.com/openai/v1";

export const groqAdapter = createOpenAiCompatibleAdapter({
  id: "groq",
  name: "Groq",
  defaultBaseUrl: GROQ_DEFAULT,
});
