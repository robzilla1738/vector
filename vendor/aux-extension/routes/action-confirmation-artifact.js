/* Aux-owned source: what an action confirmation shows (assets/action-confirmation-artifact-BOdmqe64.js, the module
 * body): a screenshot, a custom skill draft with its activation and instructions, a draft in its own
 * viewer, or the raw JSON.
 * Names the rest of the chunk uses keep their chunk names: S the artifact (exported); s the JSX runtime.
 * Chunk names used: g JSX runtime, f useApp, m cn, j a session file's URL, w ImageGallery, v/b the draft viewers. */
var s = g(),
  /** An artifact in a confirmation. */
  S = ({artifact, className, compact = false, sessionId}) => {
    const {accountId} = f(),
      frameClass = m(
        'bg-surface-primary w-full overflow-hidden rounded-xl border',
        compact ? 'max-h-56' : 'max-h-[min(28rem,55vh)]',
        className,
      );
    if (artifact.type === 'screenshot') {
      const imageClass = m(
          'bg-surface-primary w-full overflow-hidden rounded-xl',
          compact ? 'max-h-56' : 'max-h-[min(28rem,55vh)]',
          className,
        ),
        src =
          artifact.path.startsWith('http://') ||
          artifact.path.startsWith('https://') ||
          artifact.path.startsWith('data:')
            ? artifact.path
            : sessionId
              ? j(sessionId, artifact.path, {accountId})
              : artifact.path;
      return (0, s.jsx)('div', {
        className: imageClass,
        children: (0, s.jsx)(w, {
          imageClassName: 'my-0 aspect-1440/900 max-w-full object-cover object-top',
          images: [
            {alt: artifact.alt ?? artifact.caption ?? 'Action preview screenshot', caption: artifact.caption, src},
          ],
        }),
      });
    }
    return artifact.type === 'skill-draft'
      ? (0, s.jsx)(SkillDraft, {className: frameClass, compact, data: artifact.data})
      : v(artifact.type)
        ? (0, s.jsx)(b, {className: frameClass, compact, data: artifact.data, language: artifact.type, sessionId})
        : (0, s.jsx)('pre', {
            className: m(frameClass, 'text-muted-foreground overflow-auto p-3 text-xs whitespace-pre-wrap'),
            children: JSON.stringify(artifact, null, 2),
          });
  },
  /** A custom skill draft. */
  SkillDraft = ({className, compact, data}) => {
    const name = text(data.name) ?? 'Untitled skill',
      description = text(data.description),
      body = text(data.body) ?? '',
      operation = text(data.operation),
      existingName = text(data.existingSkillName),
      existingCreator = text(data.existingSkillCreator),
      keywords = textList(data.keywords),
      urlPatterns = textList(data.urlPatterns);
    return (0, s.jsxs)('div', {
      className,
      children: [
        (0, s.jsxs)('div', {
          className: 'border-border-surface border-b px-3 py-2.5',
          children: [
            (0, s.jsx)('p', {className: 'text-muted-foreground text-xs font-medium', children: 'Custom skill draft'}),
            (0, s.jsx)('h4', {className: 'text-foreground mt-0.5 truncate text-sm font-medium', children: name}),
            description &&
              (0, s.jsx)('p', {className: 'text-muted-foreground mt-1 text-xs wrap-break-word', children: description}),
            operation &&
              (0, s.jsx)('p', {
                className: 'text-muted-foreground mt-1 text-xs',
                children: operationLabel(operation, existingName, existingCreator),
              }),
          ],
        }),
        (0, s.jsxs)('div', {
          className: m('flex flex-col gap-3 overflow-auto p-3', compact ? 'max-h-36' : 'max-h-88'),
          children: [
            (keywords.length > 0 || urlPatterns.length > 0) &&
              (0, s.jsxs)('div', {
                className: 'grid gap-1.5 text-xs',
                children: [
                  (0, s.jsx)('p', {className: 'text-muted-foreground font-medium', children: 'Activation'}),
                  keywords.length > 0 && (0, s.jsx)(ActivationRow, {label: 'Keywords', values: keywords}),
                  urlPatterns.length > 0 && (0, s.jsx)(ActivationRow, {label: 'Websites', values: urlPatterns}),
                ],
              }),
            (0, s.jsxs)('div', {
              className: 'min-h-0',
              children: [
                (0, s.jsx)('p', {
                  className: 'text-muted-foreground mb-1.5 text-xs font-medium',
                  children: 'Instructions',
                }),
                (0, s.jsx)('pre', {
                  className:
                    'bg-surface-secondary text-foreground/90 max-h-64 overflow-auto rounded-md p-2 font-mono text-xs whitespace-pre-wrap',
                  children: body,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  },
  /** A row of activation values. */
  ActivationRow = ({label, values}) =>
    (0, s.jsxs)('div', {
      className: 'text-muted-foreground/90 flex min-w-0 gap-1.5',
      children: [
        (0, s.jsxs)('span', {className: 'shrink-0 font-medium', children: [label, ':']}),
        (0, s.jsx)('span', {className: 'min-w-0 truncate', children: values.join(', ')}),
      ],
    }),
  /** A value when it is text. */
  text = value => (typeof value == 'string' ? value : void 0),
  /** The text items of a value. */
  textList = value => (Array.isArray(value) ? value.filter(item => typeof item == 'string') : []);
/** What the draft does. */
function operationLabel(operation, existingName, creator) {
  return operation === 'update' && existingName
    ? `Updates My skills / ${existingName}`
    : operation === 'customize' && existingName
      ? `Customizes ${creator === 'builtin' ? 'built-in' : 'existing'} / ${existingName}`
      : 'Creates a new skill';
}
