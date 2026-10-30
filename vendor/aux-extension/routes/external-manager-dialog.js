/* Aux-owned source, onboarding › password manager (assets/import-password-mvM-KsU6.js): the Connect
 * your password manager dialog and its unlock step, all the step needs from the supplied
 * password-import-menu chunk, which Aux doesn't ship. It takes that chunk's import line, so the
 * step's `fe` stays the dialog. Aux has no built-in password manager: the choices here are the
 * user's own managers, reached through their browser extensions. */
import{A as interop,E as reactModule,w as jsxModule}from"./browser-color-scheme-Df5VSuPV.js";
import{d as Spinner}from"./error-tracking-B1YG2RRM.js";
import{_n as FieldLabel,fn as Field,mn as FieldDescription,pn as FieldContent,yn as FieldTitle}from"./strip-markdown-DRcmtuJc.js";
import{c as zodResolver,f as useForm,p as useFormContext,u as FormProvider}from"./tag-icon-DeMC7uIN.js";
import{t as ReturnArrow}from"./arrow-corner-down-left-D9tBz26z.js";
import{a as SetupDialog,c as SetupHeader,d as ProviderTile,i as PasswordInput,l as SetupBody,m as SetupLabel,n as SetupSection,o as SetupContent,s as SetupFooter,u as ProviderGrid}from"./components-BlZz2O2v.js";
import{t as LockIcon}from"./lock-CuIwHuf2.js";
import{t as Button}from"./button-82u7k4S8.js";
import{n as toast}from"./dist-LyKrHgST.js";
import{O as string,S as object,r as enumOf}from"./schemas-Z5KNLPhp.js";
import{n as RadioItem,t as RadioGroup}from"./radio-group-BMd9Xxdh.js";
import{n as defaultUnlockPreference,o as supportsUnlockPassword,r as providerDetails}from"./external-manager-DlstsZ6u.js";
var jsxRuntime = jsxModule(),
  React = interop(reactModule(), 1),
  unlockPreferences = enumOf(['remember-unlock-password', 'manual-unlock']),
  unlockSchema = object({unlockPreference: unlockPreferences, unlockPassword: string()}).refine(
    ({unlockPreference, unlockPassword}) => unlockPreference === 'manual-unlock' || unlockPassword.trim(),
    {message: 'Enter your unlock password.', path: ['unlockPassword']},
  ),
  /** One unlock choice. */
  UnlockOption = ({id, title, description, children}) =>
    (0, jsxRuntime.jsxs)('div', {
      className:
        'bg-surface-primary border-hairline dark:has-data-checked:bg-muted overflow-hidden rounded-xl border has-data-checked:bg-muted dark:border-transparent',
      children: [
        (0, jsxRuntime.jsx)(FieldLabel, {
          htmlFor: `external-unlock-${id}`,
          className: 'cursor-pointer rounded-none! border-none! bg-transparent has-data-checked:bg-transparent',
          children: (0, jsxRuntime.jsxs)(Field, {
            orientation: 'horizontal',
            className: 'px-3 pt-3 pb-2.5',
            children: [
              (0, jsxRuntime.jsxs)(FieldContent, {
                className: 'gap-0 pr-8 pl-0.5',
                children: [
                  (0, jsxRuntime.jsx)(FieldTitle, {className: 'text-sm leading-5', children: title}),
                  (0, jsxRuntime.jsx)(FieldDescription, {className: 'text-xs leading-4 font-medium', children: description}),
                ],
              }),
              (0, jsxRuntime.jsx)(RadioItem, {value: id, id: `external-unlock-${id}`}),
            ],
          }),
        }),
        children && (0, jsxRuntime.jsx)('div', {className: 'px-3 pb-3', children}),
      ],
    }),
  /** What agents do when the manager is locked. */
  UnlockChoice = ({providerLabel, canRemember}) => {
    const {watch, setValue, register, formState} = useFormContext(),
      value = watch('unlockPreference');
    return (0, jsxRuntime.jsxs)(RadioGroup, {
      className: 'gap-2',
      value,
      disabled: formState.isSubmitting,
      onValueChange: next => {
        const preference = unlockPreferences.parse(next);
        preference === value ||
          formState.isSubmitting ||
          (setValue('unlockPassword', ''), setValue('unlockPreference', preference, {shouldValidate: true}));
      },
      children: [
        canRemember &&
          (0, jsxRuntime.jsx)(UnlockOption, {
            id: 'remember-unlock-password',
            title: 'Allow Aux to unlock',
            description: `Save your ${providerLabel} unlock password so agents can unlock it during sign-in.`,
            children:
              value === 'remember-unlock-password' &&
              (0, jsxRuntime.jsx)(PasswordInput, {
                ...register('unlockPassword'),
                autoFocus: true,
                startAddon: (0, jsxRuntime.jsx)(LockIcon, {className: 'text-muted-foreground size-4'}),
                className: 'bg-background dark:bg-transparent',
                'aria-label': `${providerLabel} unlock password`,
                'aria-invalid': !!formState.errors.unlockPassword,
                autoComplete: 'off',
                disabled: formState.isSubmitting,
                placeholder: `Enter ${providerLabel} unlock password`,
                spellCheck: false,
              }),
          }),
        (0, jsxRuntime.jsx)(UnlockOption, {
          id: 'manual-unlock',
          title: 'I’ll unlock myself',
          description: `Agent may pause if ${providerLabel} is locked.`,
        }),
      ],
    });
  },
  /** The second step: how agents continue if the chosen manager is locked. */
  UnlockStep = ({provider, onBack, onConnect}) => {
    const details = providerDetails(provider),
      form = useForm({
        resolver: zodResolver(unlockSchema),
        mode: 'onChange',
        defaultValues: {unlockPreference: defaultUnlockPreference(provider), unlockPassword: ''},
      }),
      {isSubmitting, isValid} = form.formState,
      submit = form.handleSubmit(async values => {
        try {
          await onConnect(values);
        } catch {
          toast.error('Could not save your password manager preference.');
        }
      });
    return (0, jsxRuntime.jsxs)(FormProvider, {
      ...form,
      children: [
        (0, jsxRuntime.jsx)(SetupHeader, {
          title: `Connect ${details.label}`,
          description: `Choose how agents should continue if ${details.label} is locked.`,
          className: 'pt-27',
        }),
        (0, jsxRuntime.jsx)('img', {
          src: details.image,
          alt: '',
          className: 'absolute top-12 left-1/2 size-12 -translate-x-1/2 object-contain',
        }),
        (0, jsxRuntime.jsx)(SetupContent, {
          className: 'justify-center',
          children: (0, jsxRuntime.jsx)(UnlockChoice, {
            providerLabel: details.label,
            canRemember: supportsUnlockPassword(details),
          }),
        }),
        (0, jsxRuntime.jsxs)(SetupFooter, {
          children: [
            (0, jsxRuntime.jsx)(Button, {variant: 'outline', size: 'lg', disabled: isSubmitting, onClick: onBack, children: 'Back'}),
            (0, jsxRuntime.jsxs)(Button, {
              size: 'lg',
              'data-dialog-enter-action': 'true',
              disabled: isSubmitting || !isValid,
              onClick: submit,
              children: [
                isSubmitting && (0, jsxRuntime.jsx)(Spinner, {}),
                (0, jsxRuntime.jsx)('span', {children: 'Next'}),
                (0, jsxRuntime.jsx)(ReturnArrow, {className: 'size-4 opacity-50'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  /** The dialog: pick managers, detected ones first, and connect each. */
  fe = ({open, options, connectedProviders, cancelLabel = 'Cancel', onCancel, onFinish, onConnect, onProviderSelect}) => {
    const [connecting, setConnecting] = (0, React.useState)(null),
      [selected, setSelected] = (0, React.useState)(null),
      connected = new Set(connectedProviders),
      suggested = options.filter(option => option.suggested),
      others = options.filter(option => !option.suggested),
      tile = option =>
        (0, jsxRuntime.jsx)(
          ProviderTile,
          {
            image: option.image,
            label: option.label,
            status: connected.has(option.provider) ? 'Connected' : void 0,
            done: connected.has(option.provider),
            selected: selected === option.provider,
            onClick: () => {
              (setSelected(option.provider), onProviderSelect?.(option.provider));
            },
          },
          option.provider,
        );
    return (0, jsxRuntime.jsx)(SetupDialog, {
      open,
      children: connecting
        ? (0, jsxRuntime.jsx)(
            UnlockStep,
            {
              provider: connecting,
              onBack: () => setConnecting(null),
              onConnect: async values => {
                (await onConnect(connecting, values), setConnecting(null), setSelected(null));
              },
            },
            connecting,
          )
        : (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
            children: [
              (0, jsxRuntime.jsxs)(SetupBody, {
                title: 'Connect your password manager',
                description: 'Choose which ones Aux can use for sign-ins',
                children: [
                  suggested.length > 0 &&
                    (0, jsxRuntime.jsxs)('section', {
                      className: 'space-y-2',
                      children: [
                        (0, jsxRuntime.jsx)(SetupLabel, {children: 'Detected on this device'}),
                        (0, jsxRuntime.jsx)(ProviderGrid, {children: suggested.map(tile)}),
                      ],
                    }),
                  suggested.length > 0
                    ? (0, jsxRuntime.jsx)(SetupSection, {
                        title: 'Other password managers',
                        children: (0, jsxRuntime.jsx)(ProviderGrid, {children: others.map(tile)}),
                      })
                    : (0, jsxRuntime.jsx)(ProviderGrid, {children: others.map(tile)}),
                ],
              }),
              (0, jsxRuntime.jsxs)(SetupFooter, {
                className: 'justify-end',
                children: [
                  connected.size === 0 &&
                    (0, jsxRuntime.jsx)(Button, {variant: 'secondary', size: 'lg', onClick: onCancel, children: cancelLabel}),
                  (0, jsxRuntime.jsxs)(Button, {
                    size: 'lg',
                    'data-dialog-enter-action': 'true',
                    disabled: !selected && connected.size === 0,
                    onClick: () => (selected ? setConnecting(selected) : onFinish()),
                    children: [
                      (0, jsxRuntime.jsx)('span', {children: selected || connected.size === 0 ? 'Next' : 'Finish'}),
                      (0, jsxRuntime.jsx)(ReturnArrow, {className: 'size-4 opacity-50'}),
                    ],
                  }),
                ],
              }),
            ],
          }),
    });
  };
