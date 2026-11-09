import { createOpenAiCompatibleAdapter } from "./openaiCompatible";

const DEEPSEEK_DEFAULT = "https://api.deepseek.com/v1";

export const deepseekAdapter = createOpenAiCompatibleAdapter({
  id: "deepseek",
  name: "DeepSeek",
  defaultBaseUrl: DEEPSEEK_DEFAULT,
});
