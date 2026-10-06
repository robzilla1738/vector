import { staticFieldProps, staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import { SkillRepairProposalSchema, type Routine, type Run } from "@aux/contracts";
import { executeCommand } from "../commands";
import type { z } from "zod";
import { call } from "../store";
import {
  nativeStatusRoleProps,
  nativeAutocompleteOffProps,
  nativeAlertRoleProps,
} from "../ui/native-attribute-props";

/** Owner-reviewed source substitutions and a separate, durable replay test. */
export function SkillReplayPanel({
  routine,
  pageId,
  disabled,
  onChanged,
}: {
  routine: Routine;
  pageId: string | null;
  disabled: boolean;
  onChanged(): Promise<void>;
}) {
  const life = useRef(0);
  useEffect(() => {
    ++life.current;
    return () => {
      ++life.current;
    };
  }, [routine.routineId, routine.revision]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [sourceRunId, setSourceRunId] = useState(routine.sourceRunId ?? "");
  const [samples, setSamples] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [repairStep, setRepairStep] = useState("");
  const [repairTarget, setRepairTarget] = useState("");
  const [proposal, setProposal] = useState<z.infer<typeof SkillRepairProposalSchema> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void call("runs.list", { limit: 500 })
      .then((items) => {
        if (active)
          setRuns(
            items.filter(
              (run) =>
                run.status === "completed" &&
                run.config?.taskId === routine.sourceTaskId &&
                run.config?.taskRevision === routine.sourceTaskRevision,
            ),
          );
      })
      .catch(() => {
        if (active) setRuns([]);
      });
    return () => {
      active = false;
    };
  }, [routine.sourceTaskId, routine.sourceTaskRevision]);
  useEffect(() => {
    setProposal(null);
    setBusy(false);
  }, [routine.routineId, routine.revision]);
  const source = runs.find((run) => run.runId === sourceRunId);
  const replay = routine.replay;
  const readySamples =
    routine.parameters.length > 0 && routine.parameters.every((item) => !!samples[item.name]?.trim());
  const readyValues = routine.parameters.every((item) => !!values[item.name]?.trim());
  async function act(work: (current: () => boolean) => Promise<unknown>) {
    if (busy || disabled) return;
    const generation = life.current;
    const current = () => generation === life.current;
    setBusy(true);
    setError("");
    try {
      await work(current);
      if (current()) await onChanged();
    } catch (reason) {
      if (current()) setError(errorMessage(reason));
    } finally {
      if (current()) setBusy(false);
    }
  }
  return (
    <section {...staticFieldProps} aria-label="Skill replay" aria-busy={busy}>
      <strong>Tested replay</strong>
      <p {...staticHintProps}>
        Save a verified browser trace from this task. Source values are replaced with named parameters before
        the replay is saved. The Skill stays paused until a separate test passes and you review activation.
      </p>
      {replay && (
        <p {...nativeStatusRoleProps}>
          {replay.state === "tested"
            ? "Tested replay ready for review"
            : replay.state === "needs_repair"
              ? "Needs repair before reuse"
              : replay.state === "testing"
                ? "Replay test in progress"
                : "Replay needs a test"}{" "}
          · {replay.siteOrigin} · {replay.steps.length} steps
        </p>
      )}
      {replay?.testRunId && (
        <p {...staticHintProps}>
          Test run {replay.testRunId}
          {replay.testedAt ? ` · passed ${new Date(replay.testedAt).toLocaleString()}` : ""}
        </p>
      )}
      <label>
        Completed source run
        <select
          aria-label="Completed source run"
          value={sourceRunId}
          disabled={disabled || busy}
          onChange={(event) => setSourceRunId(event.target.value)}
        >
          <option value="">Choose a completed run</option>
          {runs.map((run) => (
            <option key={run.runId} value={run.runId}>
              {run.goal.slice(0, 100)} · {new Date(run.createdAt).toLocaleString()}
            </option>
          ))}
        </select>
      </label>
      {routine.parameters.map((item) => (
        <label key={`source:${item.name}`}>
          Recorded source value for {item.label}
          <input
            aria-label={`Recorded source value for ${item.label}`}
            type="text"
            {...nativeAutocompleteOffProps}
            value={samples[item.name] ?? ""}
            disabled={disabled || busy}
            onChange={(event) => setSamples((current) => ({ ...current, [item.name]: event.target.value }))}
          />
        </label>
      ))}
      <button
        {...smallButtonProps}
        disabled={disabled || busy || !readySamples || !pageId || !source?.pageIds.includes(pageId)}
        onClick={() =>
          void act(() =>
            executeCommand("prepare-skill-replay", {
              payload: {
                compileReplay: {
                  routineId: routine.routineId,
                  expectedRevision: routine.revision,
                  sourceRunId,
                  pageId: pageId!,
                  samples,
                },
              },
            }),
          )
        }
      >
        {replay ? "Repair from this run" : "Prepare replay from run"}
      </button>
      {source && pageId && !source.pageIds.includes(pageId) && (
        <p {...staticHintProps}>Open the source run’s exact tab before preparing its trace.</p>
      )}
      {replay && (
        <>
          <p {...staticHintProps}>
            Test on the current tab at the same site using fresh values. Browser writes still need their
            normal approval.
          </p>
          {routine.parameters.map((item) => (
            <label key={`test:${item.name}`}>
              Test value for {item.label}
              <input
                aria-label={`Test value for ${item.label}`}
                type="text"
                {...nativeAutocompleteOffProps}
                value={values[item.name] ?? ""}
                disabled={disabled || busy}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [item.name]: event.target.value }))
                }
              />
            </label>
          ))}
          <button
            {...smallButtonProps}
            disabled={disabled || busy || !pageId || !readyValues || replay.state === "testing"}
            onClick={() =>
              void act(() =>
                executeCommand("test-skill-replay", {
                  payload: {
                    testReplay: {
                      routineId: routine.routineId,
                      expectedRevision: routine.revision,
                      pageId: pageId!,
                      parameters: values,
                    },
                  },
                }),
              )
            }
          >
            Run replay test
          </button>
          {replay.state === "testing" && replay.testRunId && (
            <button
              {...smallGhostButtonProps}
              disabled={disabled || busy}
              onClick={() =>
                void act(() =>
                  executeCommand("check-skill-replay", {
                    payload: {
                      replayResult: {
                        routineId: routine.routineId,
                        expectedRevision: routine.revision,
                        runId: replay.testRunId!,
                      },
                    },
                  }),
                )
              }
            >
              Check test result
            </button>
          )}
        </>
      )}
      {replay?.state === "needs_repair" && (
        <>
          <p>
            A changed selector pauses this Skill. Propose a target from the current page, review the exact
            diff, then run a fresh test.
          </p>
          <label>
            Step to repair
            <select
              value={repairStep}
              onChange={(event) => {
                setRepairStep(event.target.value);
                setProposal(null);
              }}
            >
              <option value="">Choose a step</option>
              {replay.steps
                .filter((step) => "target" in step)
                .map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.id} · {step.op} · {"target" in step ? step.target : ""}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Proposed selector
            <input
              {...nativeAutocompleteOffProps}
              value={repairTarget}
              onChange={(event) => {
                setRepairTarget(event.target.value);
                setProposal(null);
              }}
            />
          </label>
          <button
            {...smallButtonProps}
            disabled={busy || disabled || !pageId || !repairStep || !repairTarget}
            onClick={() =>
              void act(async (current) => {
                const result = await executeCommand("propose-skill-repair", {
                  payload: {
                    proposeRepair: {
                      routineId: routine.routineId,
                      expectedRevision: routine.revision,
                      pageId: pageId!,
                      changes: [{ stepId: repairStep, selector: repairTarget }],
                    },
                  },
                });
                if (current()) setProposal(SkillRepairProposalSchema.parse(result));
              })
            }
          >
            Propose target repair
          </button>
          {proposal && (
            <>
              <ul>
                {proposal.changes.map((change) => (
                  <li key={change.stepId}>
                    {change.stepId}: <del>{change.before}</del> → <ins>{change.after}</ins>
                  </li>
                ))}
              </ul>
              <button
                {...smallButtonProps}
                disabled={busy || disabled}
                onClick={() =>
                  void act(async (current) => {
                    await executeCommand("approve-skill-repair", {
                      payload: {
                        applyRepair: { proposalId: proposal.proposalId, expectedRevision: routine.revision },
                      },
                    });
                    if (current()) setProposal(null);
                  })
                }
              >
                Approve this diff and require retest
              </button>
            </>
          )}
        </>
      )}
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
    </section>
  );
}
