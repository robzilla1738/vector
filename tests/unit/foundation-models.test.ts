import { expect, it } from "vitest";
import { AuxError } from "@aux/contracts";
import {
  FOUNDATION_MODEL_ID,
  type NativeFoundationCancel,
  type NativeFoundationStart,
} from "@aux/contracts/native-foundation-models";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { proposeTabTidy } from "../../apps/runtime/src/agent/tidy.js";
import type { PageTarget } from "@aux/contracts";
import { FoundationModelsClient } from "../../apps/runtime/src/services/foundation-models.js";

it("joins the original task after close even while its execution ACK is still pending", async () => {
  const token = "11111111-1111-4111-8111-111111111111";
  const taskId = "original-native-task";
  let executionReady!: () => void;
  const executing = new Promise<void>((resolve) => {
    executionReady = resolve;
  });
  let releaseExecution!: () => void;
  const executionAck = new Promise<void>((resolve) => {
    releaseExecution = resolve;
  });
  let reductionReady!: () => void;
  const reducing = new Promise<void>((resolve) => {
    reductionReady = resolve;
  });
  let joined = false;
  let originalRequest: string | undefined;
  let reconciled = false;
  class Native extends NullNativeBridge {
    async foundationModelsStart(input: NativeFoundationStart) {
      expect(input.token).toBe(token);
      if ("prepare" in input) {
        originalRequest = input.requestId;
        return { requestId: input.requestId, taskId, state: "prepared" as const, joined: true };
      }
      expect(input.requestId).toBe(originalRequest);
      expect(input.taskId).toBe(taskId);
      executionReady();
      await executionAck;
      return { requestId: input.requestId, taskId, state: "started" as const, joined: false };
    }
    async foundationModelsRead(): Promise<never> {
      throw new Error("A closed task must never publish output.");
    }
    async foundationModelsCancel(input: NativeFoundationCancel) {
      expect(input).toMatchObject({ token, taskId, requestId: originalRequest });
      reductionReady();
      if ("reconcile" in input && input.reconcile) {
        expect(joined).toBe(true);
        reconciled = true;
      }
      return { requestId: input.requestId, taskId, state: "cancelled" as const, joined };
    }
  }
  const client = new FoundationModelsClient(new Native());
  const generation = client
    .route(token, async () => {})
    .model.generateText({
      modelId: FOUNDATION_MODEL_ID,
      prompt: "Name this tab",
      maxOutputTokens: 64,
    });
  // Attach the rejection observer before cancellation so no promise is orphaned.
  const rejected = expect(generation).rejects.toBeInstanceOf(AuxError);
  await executing;
  let closed = false;
  const closing = client.close().then(() => {
    closed = true;
  });
  await reducing;
  expect(closed).toBe(false);
  expect(reconciled).toBe(false);
  joined = true;
  releaseExecution();
  await rejected;
  await closing;
  expect(reconciled).toBe(true);
  expect(closed).toBe(true);
});

it("reduces the original unexecuted reservation after its prepare ACK is lost", async () => {
  const token = "11111111-1111-4111-8111-111111111111";
  const taskId = "reserved-original-task";
  let originalRequest: string | undefined;
  let reduced = false;
  let reconciled = false;
  class Native extends NullNativeBridge {
    async foundationModelsStart(input: NativeFoundationStart): Promise<never> {
      expect("prepare" in input).toBe(true);
      originalRequest = input.requestId;
      throw new Error("Original reservation ACK lost");
    }
    async foundationModelsCancel(input: NativeFoundationCancel) {
      expect(input.token).toBe(token);
      expect(input.requestId).toBe(originalRequest);
      if ("prepare" in input) {
        expect(input.prepare).toBe(true);
        expect(reduced).toBe(false);
        reduced = true;
      } else {
        expect(input.taskId).toBe(taskId);
        expect(input.reconcile).toBe(true);
        expect(reduced).toBe(true);
        reconciled = true;
      }
      return { requestId: input.requestId, taskId, state: "cancelled" as const, joined: true };
    }
  }
  const client = new FoundationModelsClient(new Native());
  await expect(
    client
      .route(token, async () => {})
      .model.generateText({
        modelId: FOUNDATION_MODEL_ID,
        prompt: "Name this tab",
        maxOutputTokens: 64,
      }),
  ).rejects.toThrow("Original reservation ACK lost");
  await client.close();
  expect(reduced).toBe(true);
  expect(reconciled).toBe(true);
});

it("retains and retries only the original cleanup after transient cancellation ACK loss", async () => {
  const token = "11111111-1111-4111-8111-111111111111";
  const taskId = "original-retry-task";
  let originalRequest: string | undefined;
  let attempts = 0;
  let reconciled = false;
  class Native extends NullNativeBridge {
    async foundationModelsStart(input: NativeFoundationStart) {
      if ("prepare" in input) {
        originalRequest = input.requestId;
        return { requestId: input.requestId, taskId, state: "prepared" as const, joined: true };
      }
      expect(input).toMatchObject({ token, requestId: originalRequest, taskId });
      return { requestId: input.requestId, taskId, state: "started" as const, joined: false };
    }
    async foundationModelsRead(input: { token: string; requestId: string; taskId: string }) {
      expect(input).toMatchObject({ token, requestId: originalRequest, taskId });
      return {
        requestId: input.requestId,
        taskId,
        state: "completed" as const,
        joined: true,
        text: "Tab name",
      };
    }
    async foundationModelsCancel(input: NativeFoundationCancel) {
      expect(input).toMatchObject({ token, requestId: originalRequest, taskId });
      expect("prepare" in input).toBe(false);
      if ("reconcile" in input && input.reconcile) {
        expect(attempts).toBe(3);
        reconciled = true;
      } else {
        attempts++;
        if (attempts <= 2) throw new Error("Original cancellation ACK lost");
      }
      return { requestId: input.requestId, taskId, state: "cancelled" as const, joined: true };
    }
  }
  const client = new FoundationModelsClient(new Native());
  await expect(
    client
      .route(token, async () => {})
      .model.generateText({
        modelId: FOUNDATION_MODEL_ID,
        prompt: "Name this tab",
        maxOutputTokens: 64,
      }),
  ).rejects.toBeInstanceOf(AggregateError);
  expect(attempts).toBe(1);
  await expect(client.close()).rejects.toBeInstanceOf(AggregateError);
  expect(attempts).toBe(2);
  expect(reconciled).toBe(false);
  await client.close();
  expect(attempts).toBe(3);
  expect(reconciled).toBe(true);
  await expect(
    client
      .route(token, async () => {})
      .model.generateText({
        modelId: FOUNDATION_MODEL_ID,
        prompt: "New generation must remain closed",
        maxOutputTokens: 64,
      }),
  ).rejects.toBeInstanceOf(AuxError);
  expect(attempts).toBe(3);
});

it("makes a bounded on-device Tidy proposal without disclosing selected tab paths", async () => {
  const token = "11111111-1111-4111-8111-111111111111";
  const taskId = "original-tidy-task";
  let originalRequest: string | undefined;
  let joined = false;
  class Native extends NullNativeBridge {
    async foundationModelsStart(input: NativeFoundationStart) {
      if ("prepare" in input) {
        originalRequest = input.requestId;
        return { requestId: input.requestId, taskId, state: "prepared" as const, joined: true };
      }
      expect(input).toMatchObject({ token, requestId: originalRequest, taskId, maxResponseTokens: 1_024 });
      expect(input.prompt).toContain("https://example.com");
      expect(input.prompt).not.toContain("/private/");
      expect(input.prompt).not.toContain("secret-query");
      return { requestId: input.requestId, taskId, state: "started" as const, joined: false };
    }
    async foundationModelsRead(input: { token: string; requestId: string; taskId: string }) {
      expect(input).toMatchObject({ token, requestId: originalRequest, taskId });
      return {
        requestId: input.requestId,
        taskId,
        state: "completed" as const,
        joined: true,
        text: JSON.stringify({ groups: [{ name: "Reading", pageIds: ["p1", "p2"] }] }),
      };
    }
    async foundationModelsCancel(input: NativeFoundationCancel) {
      expect(input).toMatchObject({ token, requestId: originalRequest, taskId });
      joined = true;
      return { requestId: input.requestId, taskId, state: "cancelled" as const, joined: true };
    }
  }
  const client = new FoundationModelsClient(new Native());
  const pages = [1, 2, 3].map(
    (index) =>
      ({
        pageId: `p${index}`,
        url: `https://example.com/private/${index}?secret-query`,
        title: `Research ${index}`,
        controller: "human",
        viewStatus: "visible",
        ownedByRuntime: false,
      }) as PageTarget,
  );
  const proposal = await proposeTabTidy(
    { pageIds: pages.map((page) => page.pageId) },
    pages,
    client.route(token, async () => {}).model,
    { modelId: FOUNDATION_MODEL_ID, reasoning: "low" },
    undefined,
    1_024,
  );
  expect(proposal.groups).toEqual([{ name: "Reading", pageIds: ["p1", "p2"] }]);
  expect(proposal.pages).toHaveLength(3);
  expect(joined).toBe(true);
  await client.close();
});
