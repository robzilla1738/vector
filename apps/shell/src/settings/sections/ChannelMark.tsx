import type { ChannelProvider } from "@aux/contracts/channels";

export const channelLabels: Record<ChannelProvider, string> = {
  slack: "Slack",
  telegram: "Telegram",
  discord: "Discord",
};
export function ChannelMark({ provider }: { provider: ChannelProvider }) {
  return (
    <span className="channel-provider-mark" data-provider={provider} aria-hidden="true">
      <img src={`/channel-providers/${provider}.${provider === "slack" ? "png" : "svg"}`} alt="" />
    </span>
  );
}
