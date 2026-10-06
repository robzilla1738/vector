import type { Observation } from "@aux/contracts";

export function redactObservation(obs: Observation): Observation {
  return {
    ...obs,
    content: {
      ...obs.content,
      elements: obs.content.elements.map((e) =>
        e.type === "password" && e.value ? { ...e, value: "{handle}" } : e,
      ),
      formFields: obs.content.formFields.map((f) =>
        f.type === "password" && f.value ? { ...f, value: "{handle}" } : f,
      ),
    },
  };
}

