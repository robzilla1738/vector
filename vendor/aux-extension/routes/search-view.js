/* Aux-owned source, the New Tab search suggestions (assets/search-view-gCFKEZ8L.js, the module body,
 * exported as SearchView): the omnibox's autocomplete list under the New Tab search field, with the
 * typed letters highlighted, each row's icon, its actions (Switch to this tab) and its delete
 * button, and image search for a dropped or pasted image (Lens).
 * Names the rest of the chunk uses keep their chunk names: Re SearchView; p React and t JSX runtime
 * stay as named.
 * Chunk names used: W/G/Q React and JSX runtime, y cn, V cross, k history, X magnifying glass,
 * Y window cursor, U Button, C toast, J/Z/ee the avatar parts, A/te navigate to a search page and
 * its URL, E the New Tab search context, re/$/ae a match's internal page, whether it is history and
 * its scope keyword, ne SwitchCase, se the scope icons.
 * Aux change: the suggestions popup takes the 12px popover corner (rounded-xl). */
var p = W(G(), 1),
  /** Combining marks, dropped when folding case. */
  COMBINING_MARKS = new RegExp('\\p{M}+', 'gu'),
  /** A whitespace-only grapheme. */
  WHITESPACE = /^\s+$/u,
  /** Characters a match may skip. */
  SEPARATORS = new Set(['-', '_', '/', '\\', ':']),
  /** Splits text into graphemes where Intl.Segmenter exists. */
  graphemeSegmenter =
    typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(void 0, {granularity: 'grapheme'}) : null,
  /** Splits text into matched and unmatched segments: each query word matches in order, letters may be apart. */
  highlightSegments = (text, query) => {
    if (!text) return [];
    const terms = queryTerms(query);
    if (!terms.length) return [{matched: false, text}];
    const parts = graphemes(text),
      chars = searchableChars(parts);
    if (!chars.length) return [{matched: false, text}];
    const matched = new Set();
    for (const term of terms) {
      const indexes = matchTerm(chars, term);
      indexes &&
        indexes.forEach(index => {
          matched.add(index);
        });
    }
    return matched.size ? toSegments(parts, matched) : [{matched: false, text}];
  },
  /** Text as graphemes. */
  graphemes = text =>
    text
      ? graphemeSegmenter
        ? Array.from(graphemeSegmenter.segment(text), ({segment}) => segment)
        : Array.from(text)
      : [],
  /** Folds case and accents. */
  foldCase = text => text.normalize('NFKC').toLowerCase().normalize('NFKD').replace(COMBINING_MARKS, ''),
  /** The query's words, as folded characters. */
  queryTerms = query => {
    const terms = [];
    let term = [];
    for (const grapheme of graphemes(query)) {
      if (WHITESPACE.test(grapheme)) {
        term.length && (terms.push(term), (term = []));
        continue;
      }
      const chars = significantChars(foldCase(grapheme));
      chars.length && term.push(...chars);
    }
    return (term.length && terms.push(term), terms);
  },
  /** Each folded character of the text with its grapheme. */
  searchableChars = parts => {
    const chars = [];
    return (
      parts.forEach((grapheme, index) => {
        significantChars(foldCase(grapheme)).forEach(char => {
          chars.push({char, graphemeIndex: index});
        });
      }),
      chars
    );
  },
  /** Characters without whitespace and separators. */
  significantChars = text => Array.from(text).filter(char => !isSeparator(char)),
  /** Whether a character is whitespace or a separator. */
  isSeparator = char => WHITESPACE.test(char) || SEPARATORS.has(char),
  /** The graphemes a word matches, in order, or null. */
  matchTerm = (chars, term) => {
    const indexes = new Set();
    let at = 0;
    for (const char of term) {
      for (; at < chars.length && chars[at]?.char !== char; ) at += 1;
      if (at >= chars.length) return null;
      (indexes.add(chars[at].graphemeIndex), (at += 1));
    }
    return indexes;
  },
  /** Runs of matched and unmatched graphemes. */
  toSegments = (parts, matched) => {
    const segments = [];
    let text = '',
      isMatched = matched.has(0);
    return (
      parts.forEach((part, index) => {
        const partMatched = matched.has(index);
        if (index === 0) {
          text = part;
          return;
        }
        if (partMatched === isMatched) {
          text += part;
          return;
        }
        (segments.push({matched: isMatched, text}), (isMatched = partMatched), (text = part));
      }),
      segments.push({matched: isMatched, text}),
      segments
    );
  },
  t = Q(),
  /** SearchView: the image search handle, and the suggestions while the field is open. */
  Re = ({isOpen, ref}) => {
    const {
        activateScopeMatch,
        displayedMatches,
        hasManualSelection,
        matchesInput,
        removeMatch,
        scope,
        selection,
        session,
        setSelection,
      } = E(),
      viewItems = (0, p.useMemo)(
        () =>
          displayedMatches.map(({item, line}) => ({
            descriptionSegments: highlightSegments(item.description ?? '', matchesInput),
            item,
            line,
            secondarySegments: highlightSegments(item.contents || item.fillIntoEdit || '', matchesInput),
          })),
        [displayedMatches, matchesInput],
      ),
      selectedLine = Number(selection?.line ?? -1),
      openMatch = (0, p.useCallback)(
        (item, line) => () => {
          const page = re(item);
          if (page) {
            A(page);
            return;
          }
          if (!session || activateScopeMatch(item, line)) return;
          const searchPage = item.actions?.some(action => action.hint === 'Switch to this tab')
            ? null
            : te(item.destinationUrl);
          if (searchPage) {
            A(searchPage);
            return;
          }
          chrome.auxOmnibox?.openAutocompleteMatch(session.sessionId, {
            areMatchesShowing: true,
            line,
            mouseButton: 0,
            url: item.destinationUrl,
          });
        },
        [activateScopeMatch, session],
      ),
      hoveredLine = (0, p.useRef)(null),
      hoverLine = (0, p.useCallback)(
        line => event => {
          (!event.movementX && !event.movementY) ||
            hoveredLine.current === line ||
            ((hoveredLine.current = line), setSelection({actionIndex: 0, line, state: 'normal'}, {lazy: true}));
        },
        [setSelection],
      ),
      leave = (0, p.useCallback)(() => {
        ((hoveredLine.current = null), hasManualSelection || setSelection(null));
      }, [hasManualSelection, setSelection]),
      deleteMatch = (0, p.useCallback)(
        (item, line) => async event => {
          (event.preventDefault(), event.stopPropagation());
          const isHistory = $(item);
          if (!(!session && !isHistory))
            try {
              const deletions = [];
              if (session && !isHistory) {
                const deleteSuggestion = chrome.auxOmnibox?.deleteAutocompleteMatch;
                if (!deleteSuggestion) throw new Error('Search suggestions cannot be deleted from this page.');
                deletions.push(deleteSuggestion(session.sessionId, {line, url: item.destinationUrl}));
              }
              if ((isHistory || item.type === 'history-url') && item.destinationUrl) {
                if (!chrome.history?.deleteUrl) throw new Error('Browsing history cannot be deleted from this page.');
                deletions.push(chrome.history.deleteUrl({url: item.destinationUrl}));
              }
              (await Promise.all(deletions), removeMatch(line, item));
            } catch {
              C.error('Failed to delete suggestion.');
            }
        },
        [removeMatch, session],
      ),
      runAction = (0, p.useCallback)(
        (item, line, actionIndex) => event => {
          (event.preventDefault(),
            event.stopPropagation(),
            session &&
              chrome.auxOmnibox?.executeAction(session.sessionId, {
                actionIndex,
                line,
                mouseButton: 0,
                url: item.destinationUrl,
              }));
        },
        [session],
      ),
      keepFocus = (0, p.useCallback)(event => {
        event.preventDefault();
      }, []);
    return !isOpen || !viewItems.length
      ? (0, t.jsx)(ImageSearchHandle, {ref})
      : (0, t.jsxs)(t.Fragment, {
          children: [
            (0, t.jsx)(ImageSearchHandle, {ref}),
            (0, t.jsx)('div', {
              'data-omnibox-autocomplete-popup': '',
              className:
                'bg-popover border-glass absolute top-full left-0 z-100 mt-1 w-full overflow-hidden rounded-xl p-1 shadow-2xl',
              onPointerDown: keepFocus,
              onPointerLeave: leave,
              children: (0, t.jsx)('ul', {
                role: 'listbox',
                className: 'max-h-80 overflow-auto',
                children: viewItems.map(viewItem => {
                  const kind = suggestionKind(viewItem.item),
                    scopeItem = scope ? null : scopeOf(viewItem.item);
                  return (0, t.jsxs)(
                    SuggestionRow,
                    {
                      'data-active': selectedLine === viewItem.line,
                      onClick: openMatch(viewItem.item, viewItem.line),
                      onPointerMove: hoverLine(viewItem.line),
                      children: [
                        scopeItem
                          ? (0, t.jsx)(ScopeSuggestion, {scopeItem, viewItem})
                          : (0, t.jsx)(ne, {
                              value: kind,
                              caseBy: {
                                search: (0, t.jsx)(SearchSuggestion, {viewItem}),
                                history: (0, t.jsx)(HistorySuggestion, {viewItem}),
                                instant: (0, t.jsx)(InstantSuggestion, {viewItem}),
                                default: (0, t.jsx)(DefaultSuggestion, {viewItem}),
                              },
                            }),
                        viewItem.item.actions?.map((action, index) =>
                          (0, t.jsx)(
                            SuggestionAction,
                            {hint: action.hint ?? '', onClick: runAction(viewItem.item, viewItem.line, index)},
                            action.hint || index,
                          ),
                        ),
                        viewItem.item.supportsDeletion &&
                          (0, t.jsx)(U, {
                            className:
                              'absolute top-1/2 right-1 hidden -translate-y-1/2 group-data-[active=true]/autocomplete-item:flex',
                            variant: 'ghost',
                            size: 'icon-xs',
                            onClick: deleteMatch(viewItem.item, viewItem.line),
                            children: (0, t.jsx)(V, {}),
                          }),
                      ],
                    },
                    `${suggestionKey(viewItem.item, viewItem.line)}:${viewItem.line}`,
                  );
                }),
              }),
            }),
          ],
        });
  },
  /** Hands the parent a function that searches an image with Lens. */
  ImageSearchHandle = ({ref}) => {
    const {clearSearchState, session} = E(),
      searchImage = (0, p.useEffectEvent)(async file => {
        if (!session) {
          C.error('Search is not ready yet.');
          return;
        }
        try {
          const omnibox = chrome.auxOmnibox;
          if (!omnibox?.addFileContext || !omnibox.openLensSearch) throw new Error('Image search is not available.');
          const mimeType = file.type || 'application/octet-stream',
            base64 = await fileToBase64(file);
          if (
            !(
              await omnibox.addFileContext(session.sessionId, {
                bytesBase64: base64,
                fileName: file.name,
                imageDataUrl: dataUrl(mimeType, base64),
                isDeletable: true,
                mimeType,
                selectionTimeMs: Date.now(),
              })
            )?.ok
          )
            throw new Error('Failed to add image context.');
          (clearSearchState(), await nextTask(), await omnibox.openLensSearch(session.sessionId));
        } catch (error) {
          C.error(error instanceof Error ? error.message : 'Failed to search the image.');
        }
      });
    return (
      (0, p.useEffect)(
        () => (
          setRef(ref, searchImage),
          () => {
            setRef(ref, null);
          }
        ),
        [ref],
      ),
      null
    );
  },
  /** A suggestion row, marked while active. */
  SuggestionRow = ({className, children, 'data-active': active = false, ...props}) =>
    (0, t.jsxs)('li', {
      ...props,
      'data-active': active,
      'aria-selected': active,
      className: y(
        'group/autocomplete-item text-primary relative flex h-9 cursor-pointer items-center overflow-hidden rounded-xl px-1.5 py-1 text-sm font-medium',
        'data-[active=true]:bg-secondary data-[active=true]:**:data-[slot=indicator]:opacity-100',
        className,
      ),
      role: 'option',
      children: [
        (0, t.jsx)('div', {
          className: 'bg-foreground absolute top-1/2 left-0 h-3 w-1 grow -translate-1/2 rounded-full opacity-0',
          'data-slot': 'indicator',
        }),
        (0, t.jsx)('div', {
          className: 'flex w-full items-center gap-2 pl-0.5 group-data-[active=true]/autocomplete-item:pr-6',
          children,
        }),
      ],
    }),
  /** A search suggestion. */
  SearchSuggestion = ({viewItem}) =>
    (0, t.jsxs)(t.Fragment, {
      children: [
        (0, t.jsx)(SuggestionIcon, {item: viewItem.item, fallback: (0, t.jsx)(X, {className: 'size-4.5'})}),
        (0, t.jsx)(SuggestionText, {viewItem}),
      ],
    }),
  /** A history suggestion. */
  HistorySuggestion = ({viewItem}) =>
    (0, t.jsxs)(t.Fragment, {
      children: [
        (0, t.jsx)(SuggestionIcon, {item: viewItem.item, fallback: (0, t.jsx)(k, {className: 'size-4.5'})}),
        (0, t.jsx)(SuggestionText, {viewItem}),
      ],
    }),
  /** A suggestion for an instant keyword. */
  InstantSuggestion = ({viewItem}) =>
    (0, t.jsxs)(t.Fragment, {
      children: [
        (0, t.jsx)(SuggestionIcon, {item: viewItem.item, fallback: (0, t.jsx)(k, {className: 'size-4.5'})}),
        (0, t.jsx)(SuggestionText, {viewItem}),
      ],
    }),
  /** Any other suggestion. */
  DefaultSuggestion = ({viewItem}) =>
    (0, t.jsxs)(t.Fragment, {
      children: [
        (0, t.jsx)(SuggestionIcon, {item: viewItem.item, fallback: (0, t.jsx)(k, {className: 'size-4.5'})}),
        (0, t.jsx)(SuggestionText, {viewItem}),
      ],
    }),
  /** A suggestion for a scope (@tabs, @history, ...). */
  ScopeSuggestion = ({scopeItem, viewItem}) =>
    (0, t.jsxs)(t.Fragment, {
      children: [
        (0, t.jsx)('div', {
          className: 'text-muted-foreground flex size-6 shrink-0 items-center justify-center',
          children: (0, t.jsx)(scopeItem.Icon, {className: 'size-4.5'}),
        }),
        (0, t.jsx)(SuggestionText, {scopeItem, viewItem}),
      ],
    }),
  /** A suggestion's icon or image. */
  SuggestionIcon = ({item, fallback}) =>
    (0, t.jsx)('div', {
      className: 'flex size-6 shrink-0 items-center justify-center',
      children: (0, t.jsxs)(ee, {
        className: y(
          'text-muted-foreground size-4.5 rounded-xs border-none bg-transparent',
          item.imageUrl && 'size-6 rounded-sm',
        ),
        children: [
          (0, t.jsx)(Z, {src: item.imageUrl || item.iconUrl}),
          (0, t.jsx)(J, {className: 'bg-transparent [&_svg]:size-4.5', children: fallback}),
        ],
      }),
    }),
  /** A suggestion's description and secondary text. */
  SuggestionText = ({scopeItem, viewItem}) => {
    const primary = scopeItem
        ? withoutScopeHint(viewItem.descriptionSegments, scopeItem.keywordChipHint)
        : viewItem.descriptionSegments,
      secondary = scopeItem ? [{text: scopeItem.keywordChipHint, matched: false}] : viewItem.secondarySegments,
      hasPrimary = primary.length > 0,
      hasSecondary = secondary.length > 0;
    return (0, t.jsx)('div', {
      className: 'text-muted-foreground flex min-w-0 grow items-center gap-1.5',
      children: (0, t.jsx)('p', {
        className: 'min-w-0 flex-1 truncate whitespace-nowrap',
        children:
          hasPrimary && hasSecondary
            ? (0, t.jsxs)(t.Fragment, {
                children: [
                  (0, t.jsx)(Segments, {
                    className: 'text-primary',
                    matchedClassName: 'text-foreground font-semibold',
                    segments: primary,
                  }),
                  (0, t.jsx)('span', {children: ' - '}),
                  (0, t.jsx)(Segments, {
                    className: 'text-muted-foreground',
                    matchedClassName: 'text-foreground font-semibold',
                    segments: secondary,
                  }),
                ],
              })
            : (0, t.jsx)(Segments, {
                className: 'text-primary',
                matchedClassName: 'text-foreground font-semibold',
                segments: hasPrimary ? primary : secondary,
              }),
      }),
    });
  },
  /** Segments, the matched ones emphasized. */
  Segments = ({className, matchedClassName, segments}) => {
    if (!segments.length) return null;
    let offset = 0;
    return (0, t.jsx)('span', {
      children: segments.map(segment => {
        const key = `${offset}:${segment.text}`;
        return (
          (offset += segment.text.length),
          (0, t.jsx)(
            'span',
            {className: y(className, segment.matched && matchedClassName), children: segment.text},
            key,
          )
        );
      }),
    });
  },
  /** The text of segments. */
  segmentsText = segments => segments.map(segment => segment.text).join(''),
  /** A scope suggestion's description without its @keyword. */
  withoutScopeHint = (segments, hint) => {
    const text = segmentsText(segments),
      prefix = `${hint} - `,
      suffix = ` - ${hint}`;
    return text.startsWith(prefix)
      ? [{text: text.slice(prefix.length), matched: false}]
      : text.endsWith(suffix)
        ? [{text: text.slice(0, -suffix.length), matched: false}]
        : text === hint
          ? []
          : segments;
  },
  /** An action button, for the actions Aux shows. */
  SuggestionAction = ({hint, className, ...props}) => {
    const action = ACTIONS.get(hint);
    return action
      ? (0, t.jsxs)(U, {
          size: 'xs',
          variant: 'outline',
          className: y('cursor-pointer', className),
          ...props,
          children: [
            (0, t.jsx)(action.icon, {'data-icon': 'inline-start'}),
            (0, t.jsx)('span', {children: action.label}),
          ],
        })
      : null;
  },
  /** The actions Aux shows, by hint. */
  ACTIONS = new Map([['Switch to this tab', {icon: Y, label: 'Switch to this tab'}]]),
  /** A suggestion's scope, when it has a scope keyword with an icon. */
  scopeOf = item => {
    const keyword = ae(item)?.keyword,
      Icon = keyword ? se(keyword) : null;
    return !keyword || !Icon ? null : {Icon, keywordChipHint: `@${keyword}`};
  },
  /** Which row a suggestion draws. */
  suggestionKind = item =>
    item.type === 'history-url' || $(item)
      ? 'history'
      : item.isSearchType
        ? 'search'
        : item.hasInstantKeyword
          ? 'instant'
          : 'default',
  /** A suggestion's key. */
  suggestionKey = (item, line) =>
    item.destinationUrl
      ? `url:${item.type ?? ''}:${item.destinationUrl}`
      : `line:${line}:${item.type ?? ''}:${item.fillIntoEdit ?? item.contents ?? item.description ?? ''}`,
  /** Sets a ref. */
  setRef = (ref, value) => {
    if (typeof ref == 'function') {
      ref(value);
      return;
    }
    ref && (ref.current = value);
  },
  /** A file as base64. */
  fileToBase64 = async file => {
    const buffer = await file.arrayBuffer();
    return bytesToBase64(buffer);
  },
  /** A data URL. */
  dataUrl = (mimeType, base64) => `data:${mimeType};base64,${base64}`,
  /** Bytes as base64, 32K at a time. */
  bytesToBase64 = buffer => {
    const bytes = new Uint8Array(buffer),
      CHUNK = 32768;
    let binary = '';
    for (let at = 0; at < bytes.length; at += CHUNK) {
      const chunk = bytes.subarray(at, at + CHUNK);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  },
  /** Resolves after the current task. */
  nextTask = () =>
    new Promise(resolve => {
      window.setTimeout(resolve, 0);
    });
