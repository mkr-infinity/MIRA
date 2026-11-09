import { createOpenAiCompatibleAdapter } from "./openaiCompatible";

const OPENAI_DEFAULT = "https://api.openai.com/v1";

export const openaiAdapter = createOpenAiCompatibleAdapter({
  id: "openai",
  name: "OpenAI",
  defaultBaseUrl: OPENAI_DEFAULT,
});
