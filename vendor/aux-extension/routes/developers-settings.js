/* Aux-owned source: the Developers settings page (assets/developers-DTvaoVBC.js, after its imports;
 * ss exported as component). Installing, updating or reinstalling the Aux CLI; the Aux browser skill
 * for Codex, Claude Code, Cursor and OpenCode; the setup for the `aux mcp` server; the CLI questions.
 * Names the rest of the chunk uses keep their chunk names: ss the page.
 * Chunk names used: A useTRPC, v useQuery, b useMutation, D useQueryClient, I analytics, ie confirm,
 * oe useApp, pe the route, te navigate, ue/he agent icons, U markdown, z/V/W/G/Z/$ the setup dialog,
 * F the question mark, H/M/Q the tooltip, K the switch, je/Ce/xe/ge the accordion, Y/ee React.
 * Aux changes: the supplied Remote Control panel is gone; Aux has no relay. The questions and the
 * MCP tooltip describe the commands that ship: no Playwright repl, memory or Aux sign-in. */
var jsxRuntime = se(),
  CursorIcon = ({size = 24, ariaHidden = true, ...a}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...a,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M20.8423 6.47053L12.4355 1.61692C12.1655 1.46103 11.8324 1.46103 11.5625 1.61692L3.1561 6.47053C2.92917 6.60156 2.78906 6.84386 2.78906 7.10633V16.8937C2.78906 17.1557 2.92917 17.3985 3.1561 17.5295L11.5629 22.3831C11.8328 22.539 12.166 22.539 12.4359 22.3831L20.8427 17.5295C21.0696 17.3985 21.2097 17.1561 21.2097 16.8937V7.10633C21.2097 6.84427 21.0692 6.60156 20.8423 6.47053ZM20.3142 7.49863L12.1987 21.5551C12.1438 21.6498 11.999 21.6111 11.999 21.5014V12.2974C11.999 12.1135 11.9007 11.9433 11.7413 11.851L3.7706 7.2492C3.67588 7.19436 3.71456 7.04948 3.82427 7.04948H20.0553C20.2858 7.04948 20.4295 7.29891 20.3142 7.49863Z',
        fill: 'currentColor',
      }),
    }),
  CodexIcon = ({size = 24, ariaHidden = true, ...a}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...a,
      children: (0, jsxRuntime.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M9.37088 2.18576C11.1759 1.70239 13.0087 2.19059 14.3229 3.32227C16.0284 2.99798 17.8626 3.49276 19.1849 4.81496C20.5066 6.13684 21 7.96945 20.6766 9.67409C21.8096 10.9886 22.2977 12.823 21.8141 14.629C21.3301 16.4355 19.9888 17.7788 18.35 18.3506C17.7783 19.9889 16.4362 21.3295 14.6302 21.8138C12.8243 22.2976 10.9899 21.8091 9.67535 20.6763C7.97048 21.0002 6.13741 20.5067 4.81526 19.1846C3.49332 17.8624 2.99758 16.0289 3.32161 14.3235C2.18976 13.0088 1.70243 11.1746 2.18606 9.36962C2.67009 7.56414 4.00987 6.21916 5.64825 5.647C6.22058 4.009 7.56548 2.66963 9.37088 2.18576ZM12.9805 13.4704C12.4393 13.4707 12.0002 13.9097 12.0001 14.4509C12.0001 14.9922 12.4392 15.4311 12.9805 15.4313H15.9219C16.4633 15.4313 16.9023 14.9924 16.9023 14.4509C16.9022 13.9095 16.4633 13.4704 15.9219 13.4704H12.9805ZM9.40918 9.04408C9.13045 8.58016 8.52809 8.42952 8.06394 8.70801C7.60003 8.98663 7.44965 9.5891 7.72787 10.0533L8.89502 11.9998L7.72787 13.9463C7.44943 14.4104 7.60008 15.0128 8.06394 15.2915C8.52819 15.5701 9.13053 15.4196 9.40918 14.9555L10.8798 12.5044C11.0661 12.1939 11.0661 11.8057 10.8798 11.4952L9.40918 9.04408Z',
        fill: 'currentColor',
      }),
    }),
  React = Y(ee()),
  CLI_ILLUSTRATION = '/assets/aux-cli-3UABIqGq.webp',
  CLI_QUESTIONS = [
    {
      id: 'using-cli',
      question: 'How can I use Aux CLI?',
      answer:
        'Choose the command that matches the task:\n\n- `aux ask "..."` sends one prompt to the agent\'s ongoing chat and prints the reply. Anything that needs approval waits for you in Aux.\n- `aux exec "..."` runs one prompt in a chat of its own and prints JSON. Anything that needs approval is refused unless you name it with `--allow`.\n- `aux repl` is `aux ask`, one line at a time.\n- `aux mcp` lets an MCP-compatible coding agent call Aux tools itself.\n\nAux must be open. Run `aux --help`, `aux ask --help`, or `aux exec --help` for current command options.',
    },
    {
      id: 'coding-agents',
      question: 'Can’t this already be done with Codex or Claude?',
      answer: `Codex, Claude, Cursor, and OpenCode plan the work and edit code. Aux gives them your browser: your open tabs and Spaces, and an agent that works in it.

For example, your coding agent can list your tabs, or hand Aux's agent a check to run on a page with \`aux ask\`. Your passwords and cookies stay in Aux instead of being copied into prompts.`,
    },
    {
      id: 'cli-vs-mcp',
      question: 'What’s the difference between Aux CLI and MCP?',
      answer:
        'Aux CLI is the command-line entry point for humans and scripts. It includes `ask`, `exec`, `repl`, and `mcp`. MCP is the protocol integration that lets a compatible agent call Aux tools over stdio: `open`, `tabs`, `spaces`, `chats`, `status`, `resolve`, and `ask`.\n\nChoose the CLI for terminal workflows and repeatable scripts. Add MCP when the host agent should discover and call those tools during its own run. `exec` isn\'t an MCP tool, because `--allow` is a decision for a person, not the agent.',
    },
  ];
function ss() {
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(ye, {segments: ['Settings', 'Developers']}),
      (0, jsxRuntime.jsx)(we, {children: (0, jsxRuntime.jsx)('h1', {children: 'Developers'})}),
      (0, jsxRuntime.jsxs)('div', {
        className: 'space-y-8',
        children: [
          (0, jsxRuntime.jsx)(CliInstall, {}),
          (0, jsxRuntime.jsx)(L, {
            title: 'Skill & MCP',
            children: (0, jsxRuntime.jsxs)(k, {
              children: [(0, jsxRuntime.jsx)(BrowserSkillInstall, {}), (0, jsxRuntime.jsx)(McpSetup, {})],
            }),
          }),
          (0, jsxRuntime.jsx)(L, {
            title: 'FAQs',
            children: (0, jsxRuntime.jsx)(k, {
              children: (0, jsxRuntime.jsx)(je, {
                className: 'bg-surface-secondary',
                multiple: true,
                children: CLI_QUESTIONS.map(t =>
                  (0, jsxRuntime.jsxs)(
                    Ce,
                    {
                      value: t.id,
                      children: [
                        (0, jsxRuntime.jsx)(xe, {className: 'px-3.5', children: t.question}),
                        (0, jsxRuntime.jsx)(ge, {
                          className: 'text-primary px-3.5 text-sm',
                          children: (0, jsxRuntime.jsx)(U, {children: t.answer}),
                        }),
                      ],
                    },
                    t.question,
                  ),
                ),
              }),
            }),
          }),
        ],
      }),
    ],
  });
}
var /** Install, update or reinstall the Aux CLI, or copy its install command. */
  CliInstall = () => {
    const t = A(),
      {confirm} = ie(),
      {capture} = I(),
      {data, isPending} = v(t.developers.checkCliInstallation.queryOptions()),
      l = b(t.developers.installCli.mutationOptions()),
      m = data?.installCommand ?? '',
      o = data?.installed ? (data.updateAvailable ? 'update' : 'reinstall') : 'install',
      h = o === 'update' ? 'Update' : o === 'reinstall' ? 'Reinstall' : 'Install',
      g =
        data?.installed && data.updateAvailable && data.latestVersion
          ? `Aux CLI ${data.latestVersion} is available.`
          : null,
      j = () => {
        capture('settings.developers.cli.copy-install-command');
      },
      x = async C => {
        if ((C.preventDefault(), data?.installed)) {
          const s = data.updateAvailable && data.currentVersion && data.latestVersion;
          if (
            !(await confirm({
              title: s ? 'Update Aux CLI?' : 'Reinstall Aux CLI?',
              description: s
                ? `This will update Aux CLI from ${data.currentVersion} to ${data.latestVersion}.`
                : 'This will run the install script again and may overwrite your current CLI installation.',
              ui: {action: s ? 'Update' : 'Reinstall'},
            }))
          )
            return;
        }
        (capture('settings.developers.cli.install', {action: o}),
          l.mutate(void 0, {
            onSuccess(s, d, i, u) {
              (u.client.setQueryData(t.developers.checkCliInstallation.queryKey(), s),
                u.client.invalidateQueries(t.developers.checkCliInstallation.queryFilter()),
                p.success(o === 'update' ? 'Aux CLI updated.' : 'Aux CLI installed.'));
            },
            onError(s) {
              p.error(s.message);
            },
          }));
      };
    return (0, jsxRuntime.jsx)(k, {
      children: (0, jsxRuntime.jsxs)(N, {
        className: 'items-stretch gap-2.5 p-1',
        children: [
          (0, jsxRuntime.jsxs)('div', {
            className: 'flex min-w-0 flex-1 flex-col px-3.5 py-3',
            children: [
              (0, jsxRuntime.jsx)(J, {
                title: (0, jsxRuntime.jsx)('span', {className: 'text-base', children: 'Aux CLI'}),
                description: (0, jsxRuntime.jsx)('span', {
                  className: 'text-sm',
                  children: 'Browse and run web tasks from Codex, Claude Code, and more.',
                }),
              }),
              g && (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground mb-2 px-1 text-xs', children: g}),
              (0, jsxRuntime.jsx)('div', {
                className: 'mt-auto',
                children: (0, jsxRuntime.jsxs)(E, {
                  children: [
                    (0, jsxRuntime.jsxs)(re, {
                      children: [
                        (0, jsxRuntime.jsxs)(w, {
                          disabled: isPending || l.isPending || !m,
                          onClick: x,
                          children: [
                            (isPending || l.isPending) && (0, jsxRuntime.jsx)(S, {}),
                            (0, jsxRuntime.jsx)('span', {children: h}),
                          ],
                        }),
                        (0, jsxRuntime.jsx)(q, {
                          disabled: isPending || l.isPending || !m,
                          render: (0, jsxRuntime.jsx)(w, {variant: 'default', size: 'icon'}),
                          'aria-label': 'CLI install options',
                          children: (0, jsxRuntime.jsx)(me, {className: 'size-4'}),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)(T, {
                      align: 'start',
                      children: (0, jsxRuntime.jsx)(B, {
                        variant: 'ghost',
                        value: m,
                        onClick: j,
                        successMessage: 'Install command copied.',
                        render: (0, jsxRuntime.jsxs)(y, {
                          children: [
                            (0, jsxRuntime.jsx)(_, {}),
                            (0, jsxRuntime.jsx)('span', {children: 'Copy command'}),
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
              }),
            ],
          }),
          (0, jsxRuntime.jsx)('img', {
            src: CLI_ILLUSTRATION,
            alt: 'Aux CLI in a terminal',
            className: 'pointer-events-none w-72 shrink-0 rounded-[10px] object-cover select-none',
          }),
        ],
      }),
    });
  } /** Install the Aux browser skill into the coding agents found on this machine. */,
  BrowserSkillInstall = () => {
    const t = A(),
      r = D(),
      {capture} = I(),
      [n, c] = (0, React.useState)(null),
      {data: l, isPending} = v(t.developers.checkCliInstallation.queryOptions()),
      {data} = v(t.developers.checkAgentInstallations.queryOptions(void 0, {enabled: l?.installed === true})),
      h = b(
        t.developers.installAuxBrowserSkill.mutationOptions({
          onSuccess: async (s, d) => {
            if (d.id === 'general') {
              (p.success(
                s.paths.length > 0 ? 'Skill installed to all available agents.' : 'No installed agents found.',
              ),
                await r.invalidateQueries(t.developers.checkAgentInstallations.queryFilter()));
              return;
            }
            const i = SKILL_AGENTS.find(u => u.id === d.id);
            (p.success(`Skill installed to ${i?.name ?? '~/.agents/skills'}`),
              await r.invalidateQueries(t.developers.checkAgentInstallations.queryFilter()));
          },
          onError: s => {
            p.error(s.message);
          },
          onSettled: () => {
            c(null);
          },
        }),
      ),
      g = (0, React.useMemo)(() => new Map(data?.agents.map(s => [s.id, s]) ?? []), [data]),
      j = s => () => {
        (c(s), capture('settings.developers.skills.install', {target: s}), h.mutate({id: s}));
      },
      x = () => {
        (c('general'), capture('settings.developers.skills.install', {target: 'general'}), h.mutate({id: 'general'}));
      },
      C = async () => {
        capture('settings.developers.skills.download');
        try {
          const {filename, content} = await r.fetchQuery(t.developers.getAuxBrowserSkill.queryOptions()),
            i = URL.createObjectURL(new Blob([content], {type: 'text/markdown;charset=utf-8'}));
          try {
            const u = document.createElement('a');
            ((u.href = i), (u.download = filename), document.body.append(u));
            try {
              u.click();
            } finally {
              u.remove();
            }
          } finally {
            URL.revokeObjectURL(i);
          }
          p.success('Skill downloaded.');
        } catch (s) {
          p.error(s instanceof Error ? s.message : 'Could not download skill.');
        }
      };
    return (0, jsxRuntime.jsxs)(N, {
      children: [
        (0, jsxRuntime.jsx)(J, {
          title: 'Aux Skills',
          description: 'Allow agents to interact with Aux through CLI and skills',
        }),
        (0, jsxRuntime.jsx)(R, {
          children: (0, jsxRuntime.jsxs)(E, {
            children: [
              (0, jsxRuntime.jsxs)(q, {
                render: (0, jsxRuntime.jsx)(w, {variant: 'outline'}),
                children: [
                  (0, jsxRuntime.jsx)('span', {children: 'Add skill to...'}),
                  (0, jsxRuntime.jsx)(ce, {className: 'text-muted-foreground', 'data-icon': 'inline-end'}),
                ],
              }),
              (0, jsxRuntime.jsxs)(T, {
                align: 'center',
                children: [
                  (0, jsxRuntime.jsxs)(y, {
                    onClick: C,
                    children: [
                      (0, jsxRuntime.jsx)(le, {className: 'text-muted-foreground'}),
                      (0, jsxRuntime.jsx)('span', {children: 'Download'}),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)(y, {
                    disabled: isPending || !l?.installed || h.isPending,
                    onClick: x,
                    children: [
                      (0, jsxRuntime.jsx)(ae, {className: 'text-muted-foreground'}),
                      (0, jsxRuntime.jsx)('span', {className: 'grow', children: 'Install to all agents'}),
                      n === 'general' && (0, jsxRuntime.jsx)(S, {}),
                    ],
                  }),
                  (0, jsxRuntime.jsx)(ne, {}),
                  SKILL_AGENTS.map(s => {
                    const d = g.get(s.id);
                    return (0, jsxRuntime.jsxs)(
                      y,
                      {
                        disabled: isPending || !d?.installed || h.isPending,
                        onClick: j(s.id),
                        children: [
                          n === s.id
                            ? (0, jsxRuntime.jsx)(S, {})
                            : (0, jsxRuntime.jsx)(s.icon, {className: 'text-muted-foreground'}),
                          (0, jsxRuntime.jsx)('span', {children: s.name}),
                          (0, jsxRuntime.jsx)('span', {className: 'grow'}),
                          (0, jsxRuntime.jsx)(de, {
                            className: X('text-muted-foreground opacity-0', d?.skill.installed && 'opacity-100'),
                          }),
                        ],
                      },
                      s.id,
                    );
                  }),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  } /** The coding agents the skill installs into, and where. */,
  SKILL_AGENTS = [
    {id: 'codex', name: 'Codex', icon: CodexIcon, path: '~/.agents/skills'},
    {id: 'claude-code', name: 'Claude Code', icon: ue, path: '~/.claude/skills'},
    {id: 'cursor', name: 'Cursor', icon: CursorIcon, path: '~/.cursor/skills'},
    {id: 'opencode', name: 'OpenCode', icon: he, path: '~/.config/opencode/skills'},
  ] /** How to add `aux mcp` to an agent; the switch only shows whether the CLI is installed. */,
  McpSetup = () => {
    const t = A(),
      {capture} = I(),
      {data, isPending} = v(t.developers.checkCliInstallation.queryOptions()),
      config = (0, React.useMemo)(
        () => JSON.stringify({mcpServers: {aux: {command: data?.commandPath ?? 'aux', args: ['mcp']}}}, null, 2),
        [data?.commandPath],
      ),
      captureCopy = m => {
        const o = m.target;
        if (o instanceof Element) {
          if (o.closest('[data-streamdown="code-block-copy-button"]')) {
            capture('settings.developers.mcp.copy-config');
            return;
          }
          o.closest('[data-streamdown="code-block-download-button"]') && capture('settings.developers.mcp.download-config');
        }
      };
    return (0, jsxRuntime.jsxs)(N, {
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: 'min-w-0 grow px-1',
          children: [
            (0, jsxRuntime.jsx)('h4', {
              className: 'text-primary text-sm font-medium',
              'data-settings-field': 'Enable Aux MCP server',
              children: 'Enable Aux MCP server',
            }),
            (0, jsxRuntime.jsxs)(z, {
              children: [
                (0, jsxRuntime.jsxs)(V, {
                  render: (0, jsxRuntime.jsx)(w, {
                    variant: 'ghost',
                    className: 'text-muted-foreground h-auto gap-1 rounded-sm p-0 text-xs font-medium',
                  }),
                  children: [
                    (0, jsxRuntime.jsx)(F, {className: 'size-3'}),
                    (0, jsxRuntime.jsx)('span', {
                      className: 'decoration-muted-foreground/50 underline decoration-dotted underline-offset-2',
                      children: 'How to set up MCP server?',
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)(W, {
                  className: 'min-w-0 overflow-hidden sm:max-w-lg',
                  children: [
                    (0, jsxRuntime.jsxs)(G, {
                      children: [
                        (0, jsxRuntime.jsx)(Z, {children: 'Set up Aux MCP server'}),
                        (0, jsxRuntime.jsxs)($, {
                          children: [
                            'Install Aux CLI, then copy and paste this configuration into the ',
                            (0, jsxRuntime.jsx)(Code, {children: 'mcp.json'}),
                            ' (or equivalent MCP configuration) of your agent or tool.',
                          ],
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)('div', {
                      className: 'max-w-full min-w-0 overflow-hidden',
                      onClickCapture: captureCopy,
                      children: (0, jsxRuntime.jsx)(U, {
                        className:
                          'h-auto w-full max-w-full min-w-0 **:data-[streamdown="code-block-actions"]:-translate-y-2',
                        children: `\`\`\`mcp.json
${config}
\`\`\`
              `,
                      }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        (0, jsxRuntime.jsx)(R, {
          children: (0, jsxRuntime.jsxs)(Q, {
            children: [
              (0, jsxRuntime.jsx)(H, {children: (0, jsxRuntime.jsx)(K, {disabled: true, checked: data?.installed})}),
              !isPending &&
                !data?.installed &&
                (0, jsxRuntime.jsx)(M, {
                  children: (0, jsxRuntime.jsxs)('div', {
                    children: ['Install ', (0, jsxRuntime.jsx)(Code, {children: 'aux'}), ' CLI to run MCP server'],
                  }),
                }),
              !isPending &&
                data?.installed &&
                (0, jsxRuntime.jsx)(M, {
                  children: (0, jsxRuntime.jsxs)('div', {
                    children: [
                      'Add ',
                      (0, jsxRuntime.jsx)(Code, {children: 'aux mcp'}),
                      ' to your agent tool. Aux has to be open for its tools to answer.',
                    ],
                  }),
                }),
            ],
          }),
        }),
      ],
    });
  },
  Code = ({children}) =>
    (0, jsxRuntime.jsx)('code', {className: 'bg-secondary rounded-sm px-1 py-px font-mono', children});
