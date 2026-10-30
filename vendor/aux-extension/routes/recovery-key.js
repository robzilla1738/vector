/* Aux-owned source: entering your recovery key (assets/recovery-DY2UC0Rx.js, the module body): twelve
 * word fields that take a pasted phrase or a saved key file, verified to recover encrypted browser data.
 * Words are held only in the form; nothing here stores or logs them.
 * Names the rest of the chunk uses keep their chunk names: be the page (exported).
 * Chunk names used: K/D React, N JSX runtime, T useNavigate, V Link, q Spinner, I file icon, P Input,
 * z useMutation, A useTRPC, m/c the tRPC proxy and query client, j account query, $ clears the sync key
 * state, M/B/Q/b/H zod resolver, useForm, useWatch, useFormContext and provider, R Button, u toast, L/f/U zod,
 * Y error content, G/X/J/Z/ee/re the onboarding layout, g reads a recovery phrase. */
var React = K(D()),
  jsxRuntime = N();
/** The page. */
function be() {
  const navigate = T();
  return (0, jsxRuntime.jsx)(RecoveryKeyPage, {
    onRecoveryKeyVerified: () => {
      (u.success('Encrypted browser data recovered.'),
        j().then(({accountId}) =>
          navigate({to: '/u/$userId/settings/account', params: {userId: String(accountId)}, replace: true}),
        ));
    },
  });
}
var /** The heading and the form. */
  RecoveryKeyPage = ({onRecoveryKeyVerified}) => {
    const form = B({mode: 'all', resolver: M(recoverySchema), defaultValues: {recoveryWords: toWordFields([])}});
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsxs)(X, {
          children: [
            (0, jsxRuntime.jsx)(Z, {children: 'Enter your recovery key'}),
            (0, jsxRuntime.jsxs)(G, {
              children: [
                'Enter the recovery key you saved when you signed up.',
                (0, jsxRuntime.jsx)('br', {}),
                'Find the recovery-key .txt file you saved, or check your inbox.',
              ],
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)(H, {
          ...form,
          children: [
            (0, jsxRuntime.jsx)(ee, {children: (0, jsxRuntime.jsx)(RecoveryKeyForm, {onRecoveryKeyVerified})}),
            (0, jsxRuntime.jsx)(RecoveryKeyFooter, {}),
          ],
        }),
      ],
    });
  },
  /** The twelve fields and the file picker. */
  RecoveryKeyForm = ({onRecoveryKeyVerified}) => {
    const form = b(),
      fileInputRef = (0, React.useRef)(null),
      trpc = A(),
      recoverSyncKey = z(trpc.accounts.auth.recoverSyncKey.mutationOptions()),
      setWords = words => {
        form.setValue('recoveryWords', toWordFields(words), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      },
      setWord = (index, value) => {
        const next = form.getValues('recoveryWords').map(field => field.value),
          parts = splitWords(value);
        if (parts.length > 1) {
          (parts.slice(0, WORD_COUNT - index).forEach((word, offset) => {
            next[index + offset] = word;
          }),
            setWords(next));
          return;
        }
        form.setValue(`recoveryWords.${index}.value`, normalizeWord(value), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      },
      pasteAt = index => async event => {
        const text = event.clipboardData.getData('text').trim();
        !text || !/[\s\r\n]/.test(text) || (event.preventDefault(), await fillFromPhrase(index, text));
      },
      fillFromPhrase = async (index, phrase, options = {}) => {
        try {
          const recovered = splitWords((await g(phrase)).phrase);
          (setWords(recovered),
            options.submitWhenComplete &&
              recovered.length === WORD_COUNT &&
              (await form.handleSubmit(submit, () => u.error('Could not verify your recovery key.'))()));
        } catch {
          setWord(index, phrase);
        }
      },
      readFile = async event => {
        const file = event.currentTarget.files?.[0];
        ((event.currentTarget.value = ''),
          file && (await fillFromPhrase(0, await file.text(), {submitWhenComplete: true})));
      },
      openFile = () => {
        fileInputRef.current?.click();
      },
      submit = async ({recoveryWords}) => {
        try {
          const phrase = joinWords(recoveryWords),
            recovered = await g(phrase),
            {accountId} = await c.query({...j.queryOptions, staleTime: 'static'});
          (await recoverSyncKey.mutateAsync({accountId, recoveryEntropyB64: recovered.entropyB64}),
            $(),
            await Promise.all([
              c.invalidateQueries(m.accounts.get.queryFilter({accountId})),
              c.invalidateQueries(m.accounts.auth.me.queryFilter({accountId})),
              c.invalidateQueries(m.accounts.auth.syncKeyStatus.queryFilter({accountId})),
            ]),
            onRecoveryKeyVerified());
        } catch (error) {
          const content = await Y(error, 'Could not verify your recovery key.');
          u.error(content.title, {description: content.description});
        }
      };
    return (0, jsxRuntime.jsxs)('div', {
      className: 'space-y-6',
      children: [
        (0, jsxRuntime.jsx)('form', {
          id: 'recovery-key-form',
          onSubmit: form.handleSubmit(submit, () => u.error('Could not verify your recovery key.')),
          children: (0, jsxRuntime.jsx)('div', {
            className: 'grid grid-cols-4 gap-1.5',
            children: WORD_INDEXES.map(index =>
              (0, jsxRuntime.jsx)(
                P,
                {
                  ...form.register(`recoveryWords.${index}.value`),
                  type: 'text',
                  className: 'h-9 w-40 font-mono',
                  placeholder: `${index + 1}`.padStart(2, '0'),
                  onPaste: pasteAt(index),
                },
                index,
              ),
            ),
          }),
        }),
        (0, jsxRuntime.jsxs)('div', {
          className: 'text-center',
          children: [
            (0, jsxRuntime.jsx)('input', {
              ref: fileInputRef,
              type: 'file',
              accept: '.txt,text/plain',
              className: 'hidden',
              onChange: readFile,
            }),
            (0, jsxRuntime.jsxs)(R, {
              type: 'button',
              variant: 'outline',
              size: 'lg',
              disabled: form.formState.isSubmitting,
              onClick: openFile,
              children: [
                (0, jsxRuntime.jsx)(I, {className: 'text-muted-foreground', 'data-icon': 'inline-start'}),
                (0, jsxRuntime.jsx)('span', {children: 'Open a file'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  /** Use another email, and Submit. */
  RecoveryKeyFooter = () => {
    const form = b(),
      isEmpty =
        Q({control: form.control, name: 'recoveryWords'}).every(field => !field.value) ||
        Object.keys(form.formState.errors).length > 0;
    return (0, jsxRuntime.jsxs)(J, {
      children: [
        (0, jsxRuntime.jsx)(R, {
          className: 'text-muted-foreground',
          variant: 'ghost',
          size: 'lg',
          disabled: form.formState.isSubmitting,
          render: (0, jsxRuntime.jsx)(V, {to: '/auth/sign-in'}),
          children: 'Use another email',
        }),
        (0, jsxRuntime.jsxs)(re, {
          form: 'recovery-key-form',
          type: 'submit',
          disabled: form.formState.isSubmitting || isEmpty,
          children: [
            form.formState.isSubmitting && (0, jsxRuntime.jsx)(q, {}),
            (0, jsxRuntime.jsx)('span', {children: 'Submit'}),
          ],
        }),
      ],
    });
  },
  /** A recovery key has twelve words. */
  WORD_COUNT = 12,
  WORD_INDEXES = Array.from({length: WORD_COUNT}, (item, index) => index),
  /** The form. */
  recoverySchema = f({recoveryWords: U(f({value: L()})).length(WORD_COUNT)});
/** A word as the key expects it. */
function normalizeWord(value) {
  return value.toLowerCase().replace(/[^a-z]/g, '');
}
/** Twelve form fields from any number of words. */
function toWordFields(words) {
  return WORD_INDEXES.map(index => ({value: normalizeWord(words[index] ?? '')}));
}
/** A phrase as normalized words. */
function splitWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .flatMap(part => {
      const word = normalizeWord(part);
      return word ? [word] : [];
    });
}
/** The fields as one phrase. */
function joinWords(fields) {
  return fields
    .flatMap(field => {
      const word = normalizeWord(field.value);
      return word ? [word] : [];
    })
    .join(' ');
}
