import { call, useStore } from "./store";

/** Ordinary approvals retain their original pending request independently of site preferences. */
export async function decideAgentAction(
  input: { approvalId: string; turnId: string },
  decision: "accept" | "acceptForOrigin" | "decline",
) {
  const current = useStore.getState().confirmation;
  if (!current || current.approvalId !== input.approvalId || current.turnId !== input.turnId)
    throw new Error("This approval has ended or changed.");
  await call("safety.approvals.decide", {
    decision: { decision, approvalId: input.approvalId },
    expectedTurnId: input.turnId,
  });
  if (useStore.getState().confirmation === current) useStore.setState({ confirmation: null });
}
export function dismissAgentHandoff(turnId: string) {
  const current = useStore.getState().confirmation;
  if (!current || current.turnId !== turnId || current.confirmation !== "handoff")
    throw new Error("This handoff has ended or changed.");
  useStore.setState({ confirmation: null });
}
export async function takeOverAgentAction(
  input: { pageId: string; turnId: string },
  activate: (pageId: string) => unknown,
) {
  const current = useStore.getState().confirmation;
  if (
    !current ||
    current.turnId !== input.turnId ||
    current.pageId !== input.pageId ||
    current.confirmation !== "handoff"
  )
    throw new Error("This handoff has ended or changed.");
  await call("pages.takeover", { pageId: input.pageId });
  await activate(input.pageId);
  if (useStore.getState().confirmation === current) useStore.setState({ confirmation: null });
}
