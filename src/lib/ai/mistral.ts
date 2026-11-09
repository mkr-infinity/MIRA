import { createOpenAiCompatibleAdapter } from "./openaiCompatible";

const MISTRAL_DEFAULT = "https://api.mistral.ai/v1";

export const mistralAdapter = createOpenAiCompatibleAdapter({
  id: "mistral",
  name: "Mistral",
  defaultBaseUrl: MISTRAL_DEFAULT,
});
