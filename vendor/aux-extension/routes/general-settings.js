/* Aux-owned source, General settings pass 1 (assets/general-3dgRbrRk.js, from the light-field
 * visual to the page; Gg exported as component). The three.js library before it, and the Aux code
 * injected after it (AuxDeveloperSettings, AuxRoutingSettings and the cleanup and feature dialogs),
 * stay with their owners. The page: the account card, importing bookmarks and another browser's
 * data (detect, choose what, progress, already imported), the screenshot capture preference, and
 * preferred languages (search, reorder, add, remove).
 * Names the rest of the chunk uses keep their chunk names: Gg the page.
 * The second pass uses vm LightField, xm readCapture, Mm writeCapture and Pr the languages key, so
 * they keep their chunk names too.
 * Chunk names used: A JSX runtime, the three.js renderer parts, the settings sections, rows and
 * dialogs, the query hooks, chrome.auxBrowserImport and chrome.auxBrowserPreferences.
 * Aux change: the import summary card takes the 12px corner (rounded-xl) like the other cards. */
/** The animated light field behind the account card. */
function vm({
  className,
  outsideSpeed = tm,
  insideSpeed = nm,
  outsideEase = 'moderate',
  insideEase = 'dramatic',
  tiltDeg = im,
  thickness = rm,
  outerRadius = sm,
  ringWidth = am,
  rounded = true,
  color,
  fallback,
  targetFps = hm,
  minRenderSize = 0,
}) {
  const _ = (0, at.useRef)(null),
    y = (0, at.useRef)(null),
    [g, f] = (0, at.useState)(Ss),
    [R] = (0, at.useState)(em),
    {resolvedTheme} = fo(),
    x = color || ((g ?? resolvedTheme) === 'dark' ? '#FAFAFA' : '#0A0A0A');
  return (
    (0, at.useEffect)(() => {
      if (typeof MutationObserver > 'u') return;
      const T = new MutationObserver(() => f(Ss()));
      return (
        T.observe(document.documentElement, {attributeFilter: ['class'], attributes: true}),
        f(Ss()),
        () => T.disconnect()
      );
    }, []),
    (0, at.useEffect)(() => {
      const T = _.current;
      if (!T || !R) return;
      const w = 1e3 / Math.max(1, targetFps),
        P = new dh(),
        v = new Hs(-1, 1, 1, -1, 1, 2e3);
      (v.position.set(0, 0, 500), v.lookAt(0, 0, 0));
      let E;
      try {
        E = new Qp({antialias: true, alpha: true, powerPreference: 'high-performance'});
      } catch {
        return;
      }
      (E.setClearColor(0, 0),
        E.setPixelRatio(Math.min(window.devicePixelRatio, fm)),
        Object.assign(E.domElement.style, {display: 'block', height: '100%', width: '100%'}),
        T.appendChild(E.domElement));
      const k = new zs({color: x, side: 0});
      y.current = k;
      function N(ke, ze, Ue) {
        if (rounded) {
          const G = (ke + ze) / 2,
            $ = (ke - ze) / 2;
          return new nd(new pm(G), Ue.tubeSegments, $, Ue.radialSegments, true);
        }
        const M = new ws();
        M.absarc(0, 0, ke, 0, Math.PI * 2, false);
        const m = new As();
        (m.absarc(0, 0, ze, 0, Math.PI * 2, true), M.holes.push(m));
        const C = new Ra(M, {
          depth: Ue.thickness,
          bevelEnabled: true,
          bevelThickness: Ue.thickness * 0.15,
          bevelSize: Ue.thickness * 0.1,
          bevelSegments: 2,
          curveSegments: Ue.extrudeCurveSegments,
        });
        return (C.center(), C);
      }
      function B(ke) {
        const ze = outerRadius / 200,
          Ue = 200,
          M = 206,
          m = ae => (ae - Ue) * ze,
          C = ae => -(ae - M) * ze,
          G = new ws();
        (G.moveTo(m(86.9589), C(109.43)),
          G.bezierCurveTo(m(182.136), C(168.941), m(196.887), C(183.156), m(253.254), C(119.513)),
          G.lineTo(m(265.88), C(128.687)),
          G.bezierCurveTo(m(222.77), C(201.961), m(238.497), C(214.833), m(324.506), C(286.963)),
          G.lineTo(m(315.338), C(299.582)),
          G.bezierCurveTo(m(220.16), C(240.072), m(203.059), C(229.092), m(146.692), C(292.735)),
          G.lineTo(m(134.066), C(283.561)),
          G.bezierCurveTo(m(177.175), C(210.287), m(159.097), C(200.651), m(73.0883), C(128.522)),
          G.lineTo(m(86.9589), C(109.43)));
        const $ = new Ra(G, {depth: ke.thickness * 0.6, bevelEnabled: false, curveSegments: ke.fixedCurveSegments});
        return ($.center(), $);
      }
      const J = outerRadius - ringWidth,
        D = new li();
      ((D.rotation.x = ju.degToRad(tiltDeg)), P.add(D));
      const V = new li();
      D.add(V);
      const Z = new Ft(new Ot(), k);
      P.add(Z);
      const W = new Ft(new Ot(), k);
      V.add(W);
      const ce = new Ft(new Ot(), k);
      P.add(ce);
      const q = new F(),
        K = new F(),
        ee = new vi();
      let Ie = 1,
        Ae = '';
      const it = () => {
          (ee.setFromObject(P), ee.getCenter(q), ee.getSize(K), (Ie = Math.max(K.y, K.x, 1) * 0.65));
        },
        Xe = ke => {
          const ze = N(outerRadius, J, ke),
            Ue = B(ke),
            M = Z.geometry,
            m = ce.geometry;
          ((Z.geometry = ze), (W.geometry = ze), (ce.geometry = Ue), M.dispose(), m.dispose(), it());
        };
      let Y = null,
        ne = null,
        re = true,
        Te = !document.hidden,
        De = 0,
        de = 0;
      const Ke = no[outsideEase],
        te = no[insideEase],
        Q = ke => {
          if (!re || !Te) {
            ((Y = null), (ne = null));
            return;
          }
          ne === null && (ne = ke);
          const ze = ke - ne;
          if (ze < w) {
            Y = requestAnimationFrame(Q);
            return;
          }
          const Ue = ze / dm;
          ((ne = ke),
            (De += outsideSpeed * Ue),
            (de += insideSpeed * Ue),
            (Z.rotation.y = Ke(De)),
            (V.rotation.y = te(de)),
            E.render(P, v),
            (Y = requestAnimationFrame(Q)));
        },
        le = () => {
          Y !== null || !re || !Te || (Y = requestAnimationFrame(Q));
        },
        me = () => {
          Y !== null && (cancelAnimationFrame(Y), (Y = null), (ne = null));
        },
        ge = () => {
          ((Te = !document.hidden), Te ? le() : me());
        },
        we = (ke, ze) => {
          const Ue = Math.max(ke, 1),
            M = Math.max(ze, 1),
            m = Math.max(1, Math.max(minRenderSize, 0) / Math.min(Ue, M)),
            C = Math.ceil(Ue * m),
            G = Math.ceil(M * m),
            $ = gm(C, G, thickness),
            ae = [$.thickness, $.tubeSegments, $.radialSegments, $.extrudeCurveSegments, $.fixedCurveSegments].join(
              ':',
            );
          ae !== Ae && ((Ae = ae), Xe($));
          const fe = Ue / M,
            O = Ie * fe;
          ((v.left = q.x - O),
            (v.right = q.x + O),
            (v.top = q.y + Ie),
            (v.bottom = q.y - Ie),
            v.updateProjectionMatrix(),
            E.setSize(C, G, false));
        },
        {width, height} = T.getBoundingClientRect();
      we(width, height);
      const We = new ResizeObserver(([ke]) => {
        we(ke.contentRect.width, ke.contentRect.height);
      });
      We.observe(T);
      const L = new IntersectionObserver(
        ([ke]) => {
          ((re = ke?.isIntersecting ?? false), re ? le() : me());
        },
        {threshold: 0.01},
      );
      return (
        L.observe(T),
        document.addEventListener('visibilitychange', ge),
        le(),
        () => {
          (me(),
            document.removeEventListener('visibilitychange', ge),
            L.disconnect(),
            We.disconnect(),
            Z.geometry.dispose(),
            ce.geometry.dispose(),
            k.dispose(),
            (y.current = null),
            E.dispose(),
            E.domElement.parentNode === T && T.removeChild(E.domElement));
        }
      );
    }, [
      R,
      outsideSpeed,
      insideSpeed,
      outsideEase,
      insideEase,
      tiltDeg,
      thickness,
      outerRadius,
      ringWidth,
      rounded,
      targetFps,
      minRenderSize,
    ]),
    (0, at.useEffect)(() => {
      y.current?.color.set(x);
    }, [x]),
    R
      ? (0, A.jsx)('div', {ref: _, className, style: {lineHeight: 0}})
      : (0, A.jsx)('div', {className, children: fallback})
  );
}
var CAPTURE_KEY = 'aux.capture.enabled.v2',
  CAPTURE_DEFAULT = true;
function captureEnabled(e) {
  return e !== false;
}
async function xm() {
  try {
    if (typeof chrome < 'u' && chrome.storage?.local)
      return captureEnabled((await chrome.storage.local.get(CAPTURE_KEY))[CAPTURE_KEY]);
  } catch {}
  return CAPTURE_DEFAULT;
}
async function Mm(e) {
  if (typeof chrome > 'u' || !chrome.storage?.local) throw new Error('chrome.storage.local is unavailable');
  await chrome.storage.local.set({[CAPTURE_KEY]: e});
}
var /** The account card: local, paused or signed in. */
  AccountCard = ({children}) => {
    const {accountId} = Ll(),
      n = Xl(),
      i = Bn(),
      {data: r} = kl(n.accounts.get.queryOptions({accountId})),
      {data} = en({...n.accounts.auth.me.queryOptions({accountId}), retry: false}),
      [a, o] = (0, at.useState)(false),
      l = () => {
        o(true);
      },
      c = xc(async () => {
        (ql(), await i.invalidateQueries());
      });
    (0, at.useEffect)(() => {
      data && i.setQueryData(n.accounts.get.queryKey({accountId}), _ => _ && Nc(_, data));
    }, [accountId, data, i, n]);
    const h = r?.mode === 'local',
      d = r?.mode === 'cloud' && r.authStatus === 'paused';
    if (!r) return null;
    const u = data || {email: r.email ?? '', name: r.name, profileUrl: r.profileUrl ?? null, userId: r.userId ?? ''},
      p = h || d;
    return (0, A.jsxs)(A.Fragment, {
      children: [
        (0, A.jsxs)(Pi, {
          children: [
            (0, A.jsx)(un, {
              children: (0, A.jsxs)(Bt, {
                className: 'gap-2',
                children: [
                  (0, A.jsx)(Rc, {
                    name: h ? void 0 : u.name,
                    profileUrl: h ? null : u.profileUrl,
                    className: Ui('size-10 rounded-lg', d && 'grayscale'),
                    size: 'lg',
                  }),
                  (0, A.jsx)(qt, {
                    title: h ? "You're using Aux in local mode" : u.name || u.email || 'Aux Account',
                    label: 'Aux account',
                    searchTerms: ['sign out', 'sign in', 'log out', 'log in'],
                    description: h
                      ? 'Sign in to sync your data between devices.'
                      : d
                        ? 'Sync is paused. Sign in again to resume.'
                        : [
                            !['anonymous', 'email'].includes(r.provider) && `Signed in with ${hc(r.provider)}`,
                            r.provider === 'email' && 'Signed in with Aux',
                          ]
                            .filter(Boolean)
                            .join(' • '),
                  }),
                  (0, A.jsx)(pn, {
                    children: p
                      ? (0, A.jsx)(yt, {
                          variant: 'outline',
                          onClick: c,
                          children: (0, A.jsx)('span', {children: 'Sign in'}),
                        })
                      : (0, A.jsx)(yt, {
                          variant: 'outline',
                          onClick: l,
                          children: (0, A.jsx)('span', {children: 'Sign out'}),
                        }),
                  }),
                ],
              }),
            }),
            children,
          ],
        }),
        (0, A.jsx)(Lc, {accountId, open: a, onOpenChange: o}),
      ],
    });
  },
  BOOKMARK_IMPORT = ['bookmarks'],
  BOOKMARKS_IMPORT = {
    dialogDescription:
      "Bring your bookmarks, history, and other supported browser data so you don't have to set up Aux from scratch.",
    dialogTitle: 'Import from another browser',
    preparingDescription: 'Preparing your browser data...',
    progressFallbackTitle: 'Importing browser data',
    progressTitlePrefix: 'Importing from',
    successMessage: 'Browser data imported.',
  },
  BROWSER_IMPORT = {
    dialogTitle: 'Import bookmarks',
    dialogDescription: 'Choose a browser profile to import bookmarks from.',
    preparingDescription: 'Preparing your bookmarks...',
    progressFallbackTitle: 'Importing bookmarks',
    progressTitlePrefix: 'Importing bookmarks from',
    successMessage: 'Bookmarks imported.',
    dataKinds: BOOKMARK_IMPORT,
  },
  ImportBookmarks = () => (0, A.jsx)(ImportRow, {config: BOOKMARKS_IMPORT}),
  ImportBrowser = () =>
    (0, A.jsx)(ImportRow, {
      config: BROWSER_IMPORT,
    }) /** Importing bookmarks or another browser’s data, where the browser supports it. */,
  ImportRow = ({config}) => {
    const {
        dataKinds,
        dialogDescription,
        dialogTitle,
        preparingDescription,
        progressFallbackTitle,
        progressTitlePrefix,
        successMessage,
      } = config,
      [l, c] = (0, at.useState)(false),
      [h, d] = (0, at.useState)(false),
      u = canImport(),
      p = _ => {
        (!_ && h) || c(_);
      };
    return (0, A.jsxs)(Ec, {
      open: l,
      onOpenChange: p,
      children: [
        (0, A.jsx)(Mc, {
          render: (0, A.jsxs)(Ac, {
            className: Ui('cursor-pointer gap-1', !u && 'cursor-not-allowed opacity-60'),
            render: ({className, ...y}) =>
              (0, A.jsx)('button', {
                ...y,
                className: Ui('w-full cursor-pointer gap-1 text-left', className),
                disabled: !u,
              }),
            children: [
              dataKinds
                ? (0, A.jsx)(qt, {
                    title: 'Import bookmarks',
                    description: u
                      ? 'Bring bookmarks from another browser into Aux.'
                      : 'Bookmark import is unavailable in this version of Aux.',
                  })
                : (0, A.jsx)(qt, {
                    title: 'Import from another browser',
                    description: u
                      ? 'Bring your bookmarks, history, and other supported browser data into Aux.'
                      : 'Browser import is unavailable in this version of Aux.',
                  }),
              (0, A.jsx)(Pl, {className: 'text-muted-foreground size-4 shrink-0'}),
            ],
          }),
        }),
        (0, A.jsx)(yc, {
          className: 'min-h-80 w-130! max-w-none! grid-rows-[auto_1fr_auto]',
          showCloseButton: !h,
          children: (0, A.jsx)(at.Suspense, {
            fallback: (0, A.jsx)(ImportHeader, {description: dialogDescription, title: dialogTitle}),
            children: (0, A.jsx)(ImportDialog, {
              dataKinds,
              description: dialogDescription,
              onBusyChange: d,
              onClose: () => c(false),
              preparingDescription,
              progressFallbackTitle,
              progressTitlePrefix,
              successMessage,
              title: dialogTitle,
            }),
          }),
        }),
      ],
    });
  },
  canImport = () =>
    typeof chrome < 'u' && !!chrome.auxBrowserImport /** The import dialog: detect browsers, choose what, import. */,
  ImportDialog = ({
    dataKinds,
    description,
    onBusyChange,
    onClose,
    preparingDescription,
    progressFallbackTitle,
    progressTitlePrefix,
    successMessage,
    title,
  }) => {
    const c = Yl(),
      h = Bn(),
      [d, u] = (0, at.useState)(''),
      [p, _] = (0, at.useState)('idle'),
      [y, g] = (0, at.useState)(null),
      [f, R] = (0, at.useState)(null),
      [auxSearchEngine, auxSetSearchEngine] = (0, at.useState)(false),
      [auxTabs, auxSetTabs] = (0, at.useState)(false),
      b = (0, at.useMemo)(
        () =>
          dataKinds ? c.targets.filter(k => dataKinds.every(N => k.source.supportedDataKinds.includes(N))) : c.targets,
        [dataKinds, c.targets],
      ),
      x = b.find(k => k.id === d),
      T = p === 'preparing' || p === 'importing',
      w = !dataKinds;
    ((0, at.useEffect)(() => {
      onBusyChange(T);
    }, [T, onBusyChange]),
      (0, at.useEffect)(() => {
        const k = b.find(B => B.id === d);
        if (k && (!w || !k.alreadyImported)) return;
        const N = w ? Kl(b) : (b.find(B => B.detected) ?? b[0]);
        u(N?.id ?? '');
      }, [w, d, b]));
    const P = () => {
        (_('idle'), g(null), R(null));
      },
      auxOffersSearchEngine = w && !!x?.source.categories?.includes('searchEngine'),
      auxOffersTabs = w && !!x?.source.supportedDataKinds?.includes('tabs'),
      /** A full import names its kinds, so a new default search engine or a window of tabs only comes when ticked. */
      auxKinds = () => [
        ...(x.source.supportedDataKinds ?? []).filter(kind => kind !== 'tabs'),
        ...(auxOffersSearchEngine && auxSearchEngine ? ['searchEngine'] : []),
        ...(auxOffersTabs && auxTabs ? ['tabs'] : []),
      ],
      v = async () => {
        if (!x || (w && x.alreadyImported)) return;
        if (
          (_('preparing'),
          g(null),
          R(null),
          (await c.importTarget(x, {dataKinds: dataKinds ?? auxKinds(), navigateToProgress: false})) !== 'completed')
        ) {
          _('idle');
          return;
        }
        const k = Sc();
        if (!k) {
          (R('Browser import could not be prepared.'), _('failed'));
          return;
        }
        _('importing');
        try {
          if ((await vc(k, {onProgress: g})) === 'completed') {
            (_('succeeded'), Dn.success(successMessage), h.invalidateQueries({queryKey: gc.queryKey}));
            return;
          }
          _('cancelled');
        } catch (N) {
          const B = N instanceof Error ? N.message : 'Browser import failed.';
          (R(B), _('failed'), Dn.error(B));
        } finally {
          _c();
        }
      },
      E = ['importing', 'succeeded', 'failed', 'cancelled'].includes(p);
    return (0, A.jsxs)(A.Fragment, {
      children: [
        (0, A.jsxs)(go, {
          children: [
            (0, A.jsx)(vo, {className: 'font-display text-xl', children: title}),
            (0, A.jsx)(mo, {children: description}),
          ],
        }),
        E
          ? (0, A.jsx)(ImportChoice, {
              error: f,
              preparingDescription,
              progress: y,
              progressFallbackTitle,
              progressTitlePrefix,
              status: p,
              target: x,
            })
          : (0, A.jsxs)('div', {
              className: 'min-h-23 space-y-2 py-2',
              children: [
                (0, A.jsx)('p', {className: 'text-primary px-1 text-sm font-[450]', children: 'Detected browser'}),
                (0, A.jsx)(ImportTargets, {disabled: T, lockImported: w, targets: b, value: d, onChange: u}),
                auxOffersSearchEngine &&
                  (0, A.jsxs)('label', {
                    className: 'text-primary flex items-center justify-between gap-2 px-1 text-sm',
                    children: [
                      `Use ${x.source.name}’s default search engine`,
                      (0, A.jsx)(Ds, {checked: auxSearchEngine, disabled: T, onCheckedChange: auxSetSearchEngine}),
                    ],
                  }),
                auxOffersTabs &&
                  (0, A.jsxs)('label', {
                    className: 'text-primary flex items-center justify-between gap-2 px-1 text-sm',
                    children: [
                      `Open the tabs from ${x.source.name}`,
                      (0, A.jsx)(Ds, {checked: auxTabs, disabled: T, onCheckedChange: auxSetTabs}),
                    ],
                  }),
                w &&
                  x &&
                  (0, A.jsx)('p', {
                    className: 'text-muted-foreground px-1 text-xs',
                    children: x.source.supportedDataKinds?.includes('passwords')
                      ? 'Imported passwords fill in on sites. Aux doesn’t save new ones: that stays with your password manager.'
                      : `Passwords can’t come over from ${x.source.name}. They stay there and in your password manager.`,
                  }),
              ],
            }),
        (0, A.jsx)(po, {
          children:
            p === 'succeeded'
              ? (0, A.jsx)(yt, {onClick: onClose, children: 'Done'})
              : p === 'failed' || p === 'cancelled'
                ? (0, A.jsxs)(A.Fragment, {
                    children: [
                      (0, A.jsx)(yt, {variant: 'secondary', onClick: onClose, children: 'Close'}),
                      (0, A.jsx)(yt, {onClick: P, children: 'Try again'}),
                    ],
                  })
                : (0, A.jsxs)(A.Fragment, {
                    children: [
                      (0, A.jsx)(yt, {variant: 'secondary', disabled: T, onClick: onClose, children: 'Cancel'}),
                      (0, A.jsxs)(yt, {
                        disabled: !x || (w && x.alreadyImported) || T,
                        onClick: v,
                        children: [T && (0, A.jsx)(Lr, {}), 'Import'],
                      }),
                    ],
                  }),
        }),
        c.dialogs,
      ],
    });
  },
  ImportHeader = ({description, title}) =>
    (0, A.jsxs)(A.Fragment, {
      children: [
        (0, A.jsxs)(go, {
          children: [
            (0, A.jsx)(vo, {className: 'font-display text-xl', children: title}),
            (0, A.jsx)(mo, {children: description}),
          ],
        }),
        (0, A.jsxs)('div', {
          className: 'min-h-23 space-y-2 py-2',
          children: [
            (0, A.jsx)('p', {className: 'text-primary px-1 text-sm font-[450]', children: 'Detected browser'}),
            (0, A.jsx)(wi, {className: 'h-12 w-full rounded-xl'}),
          ],
        }),
        (0, A.jsxs)(po, {
          children: [
            (0, A.jsx)(yt, {variant: 'secondary', disabled: true, children: 'Cancel'}),
            (0, A.jsx)(yt, {disabled: true, children: 'Import'}),
          ],
        }),
      ],
    }),
  ImportTargets = ({disabled, lockImported, targets, value, onChange}) => {
    const s = targets.find(c => c.id === value),
      [a, o] = (0, at.useState)(false),
      l = c => () => {
        (onChange(c), o(false));
      };
    return (0, A.jsxs)(Vl, {
      open: a,
      onOpenChange: o,
      children: [
        (0, A.jsxs)(zl, {
          disabled: disabled || targets.length === 0,
          render: (0, A.jsx)(yt, {
            className: 'bg-surface-primary h-12 w-full justify-start gap-2.5 rounded-xl px-3 text-left',
            variant: 'outline',
            size: 'lg',
            type: 'button',
          }),
          children: [
            s
              ? (0, A.jsx)(ImportTarget, {lockImported, target: s})
              : (0, A.jsx)('span', {className: 'text-muted-foreground grow text-left', children: 'No browsers found'}),
            (0, A.jsx)($l, {
              className: 'text-muted-foreground shrink-0 transition-transform group-aria-expanded/button:rotate-180',
            }),
          ],
        }),
        (0, A.jsx)(Hl, {
          className:
            '-mt-(--anchor-height) w-(--anchor-width) animate-none! overflow-hidden rounded-xl p-0 data-closed:pointer-events-none',
          sideOffset: 0,
          side: 'bottom',
          children: (0, A.jsx)('div', {
            className: 'max-h-60 space-y-0.5 overflow-y-auto overscroll-contain p-1.5',
            children: targets.map(c => {
              const h = c.id === value;
              return (0, A.jsxs)(
                yt,
                {
                  className: 'data-[selected=true]:bg-accent h-10 w-full justify-start gap-2 py-0 text-left',
                  variant: 'ghost',
                  size: 'lg',
                  'data-selected': h,
                  disabled: lockImported && c.alreadyImported,
                  onClick: l(c.id),
                  children: [
                    (0, A.jsx)(ImportTarget, {lockImported, target: c, showManualImportTooltip: true}),
                    (0, A.jsx)(Jl, {className: Ui('size-4 opacity-0', h && 'opacity-100')}),
                  ],
                },
                c.id,
              );
            }),
          }),
        }),
      ],
    });
  },
  ImportTarget = ({lockImported, target, showManualImportTooltip = false}) =>
    (0, A.jsxs)(A.Fragment, {
      children: [
        (0, A.jsx)(_o, {value: target.source.id, className: 'size-6 shrink-0'}),
        (0, A.jsx)('span', {className: 'min-w-0 truncate text-left', children: target.description || target.label}),
        showManualImportTooltip && target.requiresFileImport && (0, A.jsx)(ImportLabel, {label: target.label}),
        lockImported && target.alreadyImported
          ? (0, A.jsx)('span', {
              className: 'text-muted-foreground hidden shrink-0 text-xs sm:inline',
              children: 'Already imported',
            })
          : target.lastUsedAt &&
            (0, A.jsxs)('span', {
              className: 'text-muted-foreground hidden shrink-0 text-xs sm:inline',
              children: ['Last used ', (0, A.jsx)(Bl, {datetime: target.lastUsedAt})],
            }),
        (0, A.jsx)('span', {className: 'grow'}),
      ],
    }),
  ImportLabel = ({label}) =>
    (0, A.jsxs)(mc, {
      children: [
        (0, A.jsx)(fc, {
          render: (0, A.jsx)('span', {className: 'inline-flex shrink-0'}),
          children: (0, A.jsx)(jl, {className: 'text-muted-foreground size-3.5'}),
        }),
        (0, A.jsx)(pc, {children: `${label} requires a file import manually.`}),
      ],
    }),
  ImportChoice = ({
    error,
    preparingDescription,
    progress,
    progressFallbackTitle,
    progressTitlePrefix,
    status,
    target,
  }) =>
    (0, A.jsxs)('div', {
      className: 'bg-secondary/60 my-2 rounded-xl p-4',
      children: [
        (0, A.jsxs)('div', {
          className: 'flex items-center gap-3',
          children: [
            target && (0, A.jsx)(_o, {value: target.source.id, className: 'size-9 shrink-0'}),
            (0, A.jsxs)('div', {
              className: 'min-w-0 grow',
              children: [
                (0, A.jsx)('p', {
                  className: 'text-primary font-display truncate text-sm font-medium',
                  children: target ? `${progressTitlePrefix} ${target.label}` : progressFallbackTitle,
                }),
                (0, A.jsx)('p', {
                  className: 'text-muted-foreground text-xs font-medium',
                  children: (0, A.jsx)(ImportProgress, {error, preparingDescription, progress, status}),
                }),
              ],
            }),
          ],
        }),
        (0, A.jsx)(Tc, {className: 'mt-4', value: importPercent(progress, status)}),
      ],
    }),
  ImportProgress = ({error, preparingDescription, progress, status}) =>
    status === 'failed'
      ? (0, A.jsx)('span', {children: error || progress?.errorMessage || 'Import failed.'})
      : status === 'cancelled'
        ? (0, A.jsx)('span', {children: 'Import cancelled.'})
        : status === 'succeeded'
          ? progress?.skippedDataKinds?.length
            ? (0, A.jsxs)(A.Fragment, {
                children: [
                  (0, A.jsx)('span', {
                    className: 'block',
                    children: `Imported everything except ${[...new Set(progress.skippedDataKinds)]
                      .map(kind => (kind === 'cookies' ? 'site sign-ins' : (IMPORT_KINDS.get(kind) ?? kind)))
                      .join(' and ')}.`,
                  }),
                  progress.skippedMessage &&
                    (0, A.jsx)('span', {className: 'block', children: progress.skippedMessage}),
                ],
              })
            : (0, A.jsx)('span', {children: 'Import complete.'})
          : progress?.currentDataKind
            ? (0, A.jsx)('span', {
                children: `Importing your ${IMPORT_KINDS.get(progress.currentDataKind) ?? progress.currentDataKind}...`,
              })
            : (0, A.jsx)('span', {children: preparingDescription}),
  importPercent = (e, t) => {
    if (t === 'succeeded') return 100;
    const n = e?.progress ?? 0;
    return n <= 1 ? n * 100 : n;
  },
  IMPORT_KINDS = new Map([
    ['history', 'browsing history'],
    ['bookmarks', 'bookmarks'],
    ['passwords', 'passwords'],
    ['cookies', 'cookies'],
    ['tabs', 'open tabs'],
    ['spaces', 'Spaces and pins'],
    ['searchEngine', 'default search engine'],
  ]),
  Pr = ['browserPreferences', 'languageSettings'],
  SUPPORTED_LANGUAGES_KEY = [
    'browserPreferences',
    'supportedLanguages',
  ] /** Preferred languages and the dialog that edits them. */,
  PreferredLanguages = () => {
    const [e, t] = (0, at.useState)(false),
      n = Bn(),
      i = !!Tn(),
      {data: r} = en({queryKey: Pr, queryFn: () => Wt().getLanguageSettings(), enabled: i}),
      {data} = en({queryKey: SUPPORTED_LANGUAGES_KEY, queryFn: () => Wt().getSupportedLanguages(), enabled: i}),
      a = data?.languages ?? [],
      o = r?.preferredLanguages ?? [],
      l = (0, at.useMemo)(() => uniqueLanguageCodes(o, a), [a, o]),
      c = Fn({
        mutationFn: async _ => {
          const y = uniqueLanguageCodes(_, a);
          return (await Wt().setPreferredLanguages(y), y);
        },
        onSuccess: _ => {
          (n.setQueryData(Pr, y => ({
            preferredLanguages: _,
            spellCheckEnabled: y?.spellCheckEnabled ?? r?.spellCheckEnabled ?? false,
            spellCheckSupported: y?.spellCheckSupported ?? r?.spellCheckSupported ?? false,
          })),
            t(false));
        },
        onError: _ => Dn.error(_ instanceof Error ? _.message : 'Could not update preferred languages.'),
      }),
      h = !i || !r || a.length === 0,
      d = _ => {
        c.isPending || t(_);
      },
      u = () => t(false),
      p = _ => c.mutate(_);
    return (0, A.jsxs)(Il, {
      open: e,
      onOpenChange: d,
      children: [
        (0, A.jsxs)(Bt, {
          children: [
            (0, A.jsx)(qt, {title: 'Preferred languages', description: languagesSummary(l, a, i, !!r)}),
            (0, A.jsx)(pn, {
              children: (0, A.jsxs)(Nl, {
                disabled: h,
                render: (0, A.jsx)(yt, {variant: 'outline'}),
                children: [
                  (0, A.jsx)(dc, {className: 'text-muted-foreground', 'data-icon': 'inline-start'}),
                  (0, A.jsx)('span', {children: 'Configure'}),
                ],
              }),
            }),
          ],
        }),
        (0, A.jsx)(Gl, {
          className: 'w-130! max-w-none! grid-rows-[auto_1fr_auto]',
          children: (0, A.jsx)(LanguagesDialog, {
            isSaving: c.isPending,
            languages: a,
            open: e,
            preferredLanguages: l,
            onClose: u,
            onSave: p,
          }),
        }),
      ],
    });
  },
  LanguagesDialog = ({isSaving, languages, open, preferredLanguages, onClose, onSave}) => {
    const [a, o] = (0, at.useState)(preferredLanguages),
      l = (0, at.useMemo)(() => uniqueLanguages(languages), [languages]),
      c = l.filter(f => !a.includes(f.code)),
      h = !sameLanguages(a, preferredLanguages),
      d = lc(tc(rc, {activationConstraint: {distance: 4}})),
      u = f => R => {
        o(b => b.map(x => (x === f ? R : x)));
      },
      p = f => () => {
        o(R => R.filter(b => b !== f));
      },
      _ = f => {
        f && o(R => [...R, f]);
      },
      y = () => onSave(a),
      g = ({active, over}) => {
        !over ||
          active.id === over.id ||
          o(b => {
            const x = b.indexOf(String(active.id)),
              T = b.indexOf(String(over.id));
            return x === -1 || T === -1 ? b : ac(b, x, T);
          });
      };
    return (
      (0, at.useEffect)(() => {
        open && o(preferredLanguages);
      }, [open, preferredLanguages]),
      (0, A.jsxs)(A.Fragment, {
        children: [
          (0, A.jsxs)(Ul, {
            className: 'place-items-start text-left',
            children: [
              (0, A.jsx)(Fl, {className: 'text-xl', children: 'Preferred languages'}),
              (0, A.jsx)(Cl, {children: 'Websites use the first matching language in this list when available.'}),
            ],
          }),
          (0, A.jsxs)('div', {
            className: 'min-w-0 space-y-3 overflow-x-hidden overflow-y-auto py-1',
            children: [
              (0, A.jsx)(oc, {
                sensors: d,
                collisionDetection: uc,
                onDragEnd: g,
                children: (0, A.jsx)(cc, {
                  items: a,
                  strategy: ec,
                  children: (0, A.jsx)('div', {
                    children: a.map((f, R) =>
                      (0, A.jsx)(
                        LanguageRow,
                        {code: f, index: R, languages: l, selectedCodes: a, onChange: u(f), onRemove: p(f)},
                        f,
                      ),
                    ),
                  }),
                }),
              }),
              (0, A.jsxs)(Dr, {
                value: null,
                disabled: c.length === 0,
                onValueChange: _,
                children: [
                  (0, A.jsxs)(Ir, {
                    render: ({className, ...R}) =>
                      (0, A.jsx)(yt, {...R, variant: 'outline', className: 'pr-2.5! [&_svg]:last:hidden'}),
                    children: [(0, A.jsx)(Dl, {'data-icon': 'inline-start'}), (0, A.jsx)('span', {children: 'Add'})],
                  }),
                  (0, A.jsx)(Nr, {
                    align: 'start',
                    alignItemWithTrigger: false,
                    className: 'max-h-64 w-(--anchor-width) min-w-64',
                    children: c.map(f => (0, A.jsx)(Oi, {value: f.code, children: f.displayName}, f.code)),
                  }),
                ],
              }),
            ],
          }),
          (0, A.jsxs)(Ol, {
            className: 'mx-0 mb-0 p-0',
            children: [
              (0, A.jsx)(yt, {variant: 'secondary', disabled: isSaving, onClick: onClose, children: 'Cancel'}),
              (0, A.jsxs)(yt, {
                disabled: !h || a.length === 0 || isSaving,
                onClick: y,
                children: [isSaving && (0, A.jsx)(Lr, {}), (0, A.jsx)('span', {children: 'Save'})],
              }),
            ],
          }),
        ],
      })
    );
  },
  LanguageRow = ({code, index, languages, selectedCodes, onChange, onRemove}) => {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = ic({id: code}),
      u = p => {
        p && onChange(p);
      };
    return (0, A.jsxs)('div', {
      ref: setNodeRef,
      className: Ui('flex min-w-0 items-center gap-2 border-t py-2', isDragging && 'bg-surface-primary z-1'),
      style: {
        transform: sc.Transform.toString(transform ? {...transform, x: 0} : null),
        transition,
        zIndex: isDragging ? 1 : void 0,
      },
      children: [
        (0, A.jsx)('button', {
          type: 'button',
          'aria-label': `Reorder language ${index + 1}`,
          className: 'text-muted-foreground cursor-grab touch-none active:cursor-grabbing',
          ...attributes,
          ...listeners,
          children: (0, A.jsx)(nc, {className: '-ml-1 size-4'}),
        }),
        (0, A.jsx)('span', {
          className:
            'text-muted-foreground bg-muted flex size-5 shrink-0 items-center justify-center rounded-sm text-right text-xs tabular-nums',
          children: index + 1,
        }),
        (0, A.jsx)('div', {
          className: 'relative min-w-0 flex-1',
          children: (0, A.jsxs)(Dr, {
            value: code,
            onValueChange: u,
            children: [
              (0, A.jsx)(Ir, {className: 'max-w-full', children: (0, A.jsx)(Is, {placeholder: 'Select..'})}),
              (0, A.jsx)(Nr, {
                className: 'max-h-64 w-(--anchor-width) min-w-64',
                align: 'start',
                alignItemWithTrigger: false,
                children: languages.map(p =>
                  (0, A.jsx)(
                    Oi,
                    {
                      value: p.code,
                      disabled: p.code !== code && selectedCodes.includes(p.code),
                      children: p.displayName,
                    },
                    p.code,
                  ),
                ),
              }),
            ],
          }),
        }),
        (0, A.jsx)(yt, {
          variant: 'ghost',
          size: 'icon-sm',
          'aria-label': `Remove language ${index + 1}`,
          onClick: onRemove,
          children: (0, A.jsx)(Ql, {className: 'text-muted-foreground size-4'}),
        }),
      ],
    });
  },
  uniqueLanguageCodes = (e, t) => {
    const n = [],
      i = new Set();
    for (const r of e) {
      const s = findLanguage(r, t),
        a = s ? languageKey(s) : normalize(r);
      i.has(a) || (i.add(a), n.push(s?.code ?? r));
    }
    return n;
  },
  uniqueLanguages = e => {
    const t = new Set();
    return e.filter(n => {
      const i = languageKey(n);
      return t.has(i) ? false : (t.add(i), true);
    });
  },
  findLanguage = (e, t) => {
    const n = t.find(s => normalize(s.code) === normalize(e)),
      i = baseLanguage(e),
      r = i ? t.find(s => normalize(s.code) === i) : void 0;
    return n && r && languageKey(n) === languageKey(r)
      ? preferredVariant(r, t)
      : n
        ? preferredVariant(n, t)
        : r
          ? preferredVariant(r, t)
          : null;
  },
  preferredVariant = (e, t) => {
    const n = languageKey(e),
      i = baseLanguage(e.code);
    if (i) {
      const r = t.find(s => normalize(s.code) === i && languageKey(s) === n);
      if (r) return r;
    }
    return t.find(r => languageKey(r) === n) ?? e;
  },
  languageKey = e => `${e.displayName.toLowerCase()}\0${e.nativeDisplayName.toLowerCase()}`,
  baseLanguage = e => {
    const t = normalize(e),
      [n] = t.split('-');
    return n && n !== t ? n : null;
  },
  normalize = e => e.trim().toLowerCase(),
  languagesSummary = (e, t, n, i) => {
    if (!n) return 'Language settings are unavailable';
    if (!i) return 'Loading language settings...';
    if (e.length === 0) return 'No preferred languages';
    const r = e.map(s => t.find(a => a.code === s)?.displayName ?? s);
    return r.length <= 2 ? r.join(', ') : `${r.slice(0, 2).join(', ')} +${r.length - 2} more`;
  },
  sameLanguages = (e, t) => e.length === t.length && e.every((n, i) => n === t[i]); /** The General settings page. */
function Gg() {
  const e = _l();
  return (0, A.jsxs)(A.Fragment, {
    children: [
      (0, A.jsx)(Cc, {segments: ['Settings', 'General']}),
      (0, A.jsx)(bc, {children: (0, A.jsx)('h1', {children: 'General'})}),
      (0, A.jsxs)('div', {
        className: 'space-y-8',
        children: [
          (0, A.jsx)(qm, {}),
          (0, A.jsxs)(Pi, {
            title: 'Preferences',
            children: [
              (0, A.jsxs)(un, {
                children: [
                  (0, A.jsx)(Ym, {}),
                  (0, A.jsx)(AuxRoutingSetting, {}),
                  (0, A.jsx)(AuxCleanupSetting, {}),
                  (0, A.jsx)(Km, {}),
                  (0, A.jsx)(AuxConfirmQuitSetting, {}),
                ],
              }),
              (0, A.jsxs)(un, {children: [e && (0, A.jsx)(Zm, {}), (0, A.jsx)(jm, {})]}),
              (0, A.jsx)(AuxDeveloperSettings, {}),
              (0, A.jsxs)(un, {children: [(0, A.jsx)(PreferredLanguages, {}), (0, A.jsx)(Qm, {})]}),
            ],
          }),
          (0, A.jsx)(Pi, {
            title: 'Import',
            children: (0, A.jsxs)(un, {
              children: [
                (0, A.jsx)(ImportBookmarks, {}),
                (0, A.jsx)(ImportBrowser, {}),
                (0, A.jsxs)(Ac, {
                  className: 'cursor-pointer gap-1',
                  render: ({className, ...y}) =>
                    (0, A.jsx)('button', {
                      ...y,
                      type: 'button',
                      className: Ui('w-full cursor-pointer gap-1 text-left', className),
                      onClick: () =>
                        chrome.tabs.create({url: chrome.runtime.getURL('main.html#/onboarding/glance')}),
                    }),
                  children: [
                    (0, A.jsx)(qt, {
                      title: 'Run setup again',
                      description:
                        'Import from another browser, connect your password manager and models, and choose the finishing touches.',
                    }),
                    (0, A.jsx)(Pl, {className: 'text-muted-foreground size-4 shrink-0'}),
                  ],
                }),
              ],
            }),
          }),
          (0, A.jsxs)(Pi, {
            title: 'About Aux',
            children: [(0, A.jsx)(un, {children: (0, A.jsx)(ag, {})}), (0, A.jsx)(og, {})],
          }),
        ],
      }),
    ],
  });
}
