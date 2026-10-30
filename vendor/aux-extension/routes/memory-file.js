/* Aux-owned source: a memory file (assets/files-DqqxHH6i.js, after its imports; ye exported as
 * component): preview or edit the file, save or cancel, open it, and its actions.
 * Names the rest of the chunk uses keep their chunk names: ye the page. */
var React = N(k(), 1),
  jsxRuntime = F(),
  OpenFileButton = ({accountId, file}) => {
    const o = j(),
      s = $(),
      [m, a] = (0, React.useState)(false),
      n = C(o.meta.open.mutationOptions({onError: () => M.error(s.revealError)})),
      i = () => a(true),
      l = () => n.mutate({accountId, path: file.absolutePath, mode: 'reveal'});
    return file.sizeBytes > 262144 && !m
      ? (0, jsxRuntime.jsxs)('div', {
          className: 'flex size-full flex-col items-center justify-center gap-3 px-4 text-center text-sm',
          children: [
            (0, jsxRuntime.jsx)('p', {
              className: 'max-w-full truncate font-medium',
              children: file.path.split('/').at(-1),
            }),
            (0, jsxRuntime.jsxs)('p', {
              className: 'text-muted-foreground',
              children: ['This file is ', B(file.sizeBytes), '. Opening it may be slow.'],
            }),
            (0, jsxRuntime.jsxs)(u, {
              children: [
                (0, jsxRuntime.jsx)(h, {onClick: i, children: 'Open file'}),
                (0, jsxRuntime.jsxs)(_, {
                  children: [
                    (0, jsxRuntime.jsx)(z, {
                      render: (0, jsxRuntime.jsx)(h, {size: 'icon', 'aria-label': 'More file actions'}),
                      children: (0, jsxRuntime.jsx)(O, {className: 'size-4'}),
                    }),
                    (0, jsxRuntime.jsx)(T, {
                      align: 'end',
                      children: (0, jsxRuntime.jsx)(E, {
                        children: (0, jsxRuntime.jsxs)(b, {
                          disabled: n.isPending,
                          onClick: l,
                          children: [(0, jsxRuntime.jsx)(R, {className: 'size-4'}), s.revealLabel],
                        }),
                      }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      : (0, jsxRuntime.jsx)(MemoryFile, {accountId, file});
  } /** A memory file: preview or edit, with save and cancel. */,
  MemoryFile = ({accountId, file}) => {
    const o = j(),
      {data} = S(o.memory.readFile.queryOptions({filePath: file.path, accountId})),
      [m, a] = (0, React.useState)('preview'),
      [n, i] = (0, React.useState)(data.content),
      [l, d] = (0, React.useState)(data.content),
      v = () => {
        (d(n), a('preview'));
      },
      p = c => {
        (i(c), d(c), a('preview'));
      };
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(FileToolbar, {
          accountId,
          file,
          mode: m,
          value: l,
          onModeChange: a,
          onCancel: v,
          onSaveSuccess: p,
        }),
        (0, jsxRuntime.jsx)('div', {
          className: 'min-h-0 grow',
          children: (0, jsxRuntime.jsx)(V, {
            className: 'size-full min-h-0',
            children:
              m === 'preview'
                ? (0, jsxRuntime.jsx)('div', {
                    className: 'mx-auto w-full max-w-(--breakpoint-md) py-3',
                    children: (0, jsxRuntime.jsx)(D, {children: l}),
                  })
                : (0, jsxRuntime.jsx)(MarkdownEditor, {value: l, onChange: d}),
          }),
        }),
      ],
    });
  } /** The markdown editor for a memory file. */,
  MarkdownEditor = ({value, onChange}) => {
    const o = K({
      contentType: 'markdown',
      content: value,
      extensions: s => [...s, A],
      editorProps: {attributes: {class: 'h-full overflow-auto px-4 py-3 text-sm leading-7 outline-none ring-0'}},
      onUpdate: ({editor}) => {
        onChange(editor.getMarkdown());
      },
    });
    return (0, jsxRuntime.jsx)(H, {editor: o});
  },
  FileToolbar = ({accountId, file, mode, value, onCancel, onModeChange, onSaveSuccess}) => {
    const i = j(),
      l = C(i.memory.writeFile.mutationOptions()),
      d = () => {
        onModeChange('edit');
      },
      v = () => {
        l.mutate(
          {filePath: file.path, content: value, accountId},
          {
            onSuccess: (c, f, g, w) => {
              (w.client.setQueryData(i.memory.readFile.queryKey({filePath: file.path, accountId}), c),
                w.client.invalidateQueries(i.memory.listFiles.queryFilter({accountId})),
                onSaveSuccess(c.content));
            },
            onError: c => {
              (M.error('There was an error saving the memory file.'), console.error(c));
            },
          },
        );
      },
      p = file.path.split('/');
    return (0, jsxRuntime.jsxs)('header', {
      className: 'flex h-12 shrink-0 items-center justify-between gap-3 border-b px-3',
      children: [
        (0, jsxRuntime.jsx)('div', {
          className: 'flex min-w-0 items-center gap-1 text-sm',
          children: p.map((c, f) => {
            const g = f === p.length - 1;
            return (0, jsxRuntime.jsxs)(
              'div',
              {
                className: 'flex min-w-0 items-center gap-1',
                children: [
                  f > 0 && (0, jsxRuntime.jsx)(I, {className: 'text-muted-foreground size-4 shrink-0'}),
                  g && (0, jsxRuntime.jsx)(U, {className: 'text-muted-foreground size-4 shrink-0'}),
                  (0, jsxRuntime.jsx)('span', {
                    className: g ? 'truncate font-medium' : 'text-muted-foreground truncate',
                    children: c,
                  }),
                ],
              },
              p.slice(0, f + 1).join('/'),
            );
          }),
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'flex shrink-0 items-center gap-2',
          children: [
            (0, jsxRuntime.jsxs)(L, {
              children: [
                (0, jsxRuntime.jsxs)(Q, {
                  render: (0, jsxRuntime.jsx)('span', {
                    className: 'text-muted-foreground flex items-center gap-1 text-xs',
                  }),
                  children: [
                    (0, jsxRuntime.jsx)(q, {className: 'size-3.5 shrink-0'}),
                    (0, jsxRuntime.jsx)('span', {children: J(file.lastUpdatedAt)}),
                  ],
                }),
                (0, jsxRuntime.jsx)(G, {children: W(file.lastUpdatedAt)}),
              ],
            }),
            mode === 'preview'
              ? (0, jsxRuntime.jsx)(u, {
                  children: (0, jsxRuntime.jsx)(h, {
                    onClick: d,
                    children: (0, jsxRuntime.jsx)('span', {children: 'Edit'}),
                  }),
                })
              : (0, jsxRuntime.jsxs)(u, {
                  className: 'gap-1!',
                  children: [
                    (0, jsxRuntime.jsx)(u, {
                      children: (0, jsxRuntime.jsx)(h, {
                        variant: 'secondary',
                        disabled: l.isPending,
                        onClick: onCancel,
                        children: 'Cancel',
                      }),
                    }),
                    (0, jsxRuntime.jsx)(u, {
                      children: (0, jsxRuntime.jsxs)(h, {
                        disabled: l.isPending,
                        onClick: v,
                        children: [
                          l.isPending && (0, jsxRuntime.jsx)(P, {}),
                          (0, jsxRuntime.jsx)('span', {children: 'Save'}),
                        ],
                      }),
                    }),
                  ],
                }),
          ],
        }),
      ],
    });
  }; /** The memory file page, or no files yet. */
function ye() {
  const {userId} = y.useParams(),
    {path} = y.useSearch(),
    o = y.useNavigate(),
    s = Number.parseInt(userId, 10),
    m = j(),
    {data} = S(m.memory.listFiles.queryOptions({accountId: s}, {select: X})),
    n = path ? data.fileByPath.get(path) : void 0;
  return (
    (0, React.useEffect)(() => {
      if (n) return;
      const i = data.filePaths[0];
      i && o({to: '.', search: {path: i}, replace: true, resetScroll: false});
    }, [data.filePaths, o, n]),
    n
      ? (0, jsxRuntime.jsx)(OpenFileButton, {accountId: s, file: n}, `${s}:${n.path}`)
      : (0, jsxRuntime.jsx)('div', {
          className: 'text-muted-foreground flex size-full items-center justify-center px-4 text-center text-sm',
          children: 'No memory files yet',
        })
  );
}
