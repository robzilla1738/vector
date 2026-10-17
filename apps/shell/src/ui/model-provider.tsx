import { MODEL_PROVIDER_NAMES } from "@aux/contracts";
import openai from "../assets/model-providers/openai.svg";
import anthropic from "../assets/model-providers/anthropic.svg";
import google from "../assets/model-providers/gemini.svg";
import meta from "../assets/model-providers/meta.svg";
import alibaba from "../assets/model-providers/qwen.svg";
import gateway from "../assets/model-providers/vercel.svg";
import openrouter from "../assets/model-providers/openrouter.svg";
import copilot from "../assets/model-providers/githubcopilot.svg";
import deepseek from "../assets/model-providers/deepseek.svg";
import mistral from "../assets/model-providers/mistral.svg";
import "./model-provider.css";

const marks: Record<string, string> = {
  openai,
  chatgpt: openai,
  anthropic,
  google,
  meta,
  alibaba,
  gateway,
  vercel: gateway,
  openrouter,
  copilot,
  deepseek,
  mistral,
};
const names: Record<string, string> = {
  ...MODEL_PROVIDER_NAMES,
  meta: "Meta",
  alibaba: "Alibaba",
  deepseek: "DeepSeek",
  mistral: "Mistral",
  chatgpt: "ChatGPT",
  copilot: "GitHub Copilot",
};
export function modelProviderName(provider: string): string {
  return names[provider] ?? provider;
}

/** Local library marks inherit the surface's ink in both themes. Unknown providers retain their text label. */
export function ModelProviderMark({ provider }: { provider?: string }) {
  const source = provider ? marks[provider] : undefined;
  return source ? (
    <i
      className="model-provider-mark"
      aria-hidden="true"
      style={{ maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")` }}
    />
  ) : null;
}
