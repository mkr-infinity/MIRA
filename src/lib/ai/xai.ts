import { createOpenAiCompatibleAdapter } from "./openaiCompatible";

const XAI_DEFAULT = "https://api.x.ai/v1";

export const xaiAdapter = createOpenAiCompatibleAdapter({
  id: "xai",
  name: "xAI (Grok)",
  defaultBaseUrl: XAI_DEFAULT,
});
