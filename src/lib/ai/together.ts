import { createOpenAiCompatibleAdapter } from "./openaiCompatible";

const TOGETHER_DEFAULT = "https://api.together.xyz/v1";

export const togetherAdapter = createOpenAiCompatibleAdapter({
  id: "together",
  name: "Together AI",
  defaultBaseUrl: TOGETHER_DEFAULT,
});
