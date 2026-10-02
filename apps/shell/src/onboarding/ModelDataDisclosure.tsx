export function ModelDataDisclosure({ reviewed }: { reviewed: boolean }) {
  const disclosure = (
    <>
      <p>
        Model requests send your prompt, selected page context and attached material to the provider you
        choose. Gateway routes requests to that provider; BYOK uses your chosen provider account. Usage may
        cost money. Credentials are saved through the OS credential store.
      </p>
      <p>
        <strong>Muse Spark 1.3 Contributor:</strong> this tier lets Meta use prompts and completions sent to
        it to improve its models. Select a provider and model whose data use fits your work.
      </p>
    </>
  );
  return reviewed ? (
    <details className="onboarding-details">
      <summary>Model data use and costs</summary>
      {disclosure}
    </details>
  ) : (
    disclosure
  );
}
