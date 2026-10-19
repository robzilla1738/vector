const theme = localStorage.getItem('aux.theme') ?? 'system';
document.documentElement.dataset.theme =
  theme === 'system'
    ? matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : theme;

document.documentElement.dataset.surface = ['', '#', '#/'].includes(
  location.hash,
)
  ? 'newtab'
  : 'app';
const first = document.querySelector<HTMLInputElement>('#first-input');
if (first) {
  first.addEventListener('input', () => {
    const hint = document.querySelector<HTMLElement>('.first-hint');
    if (hint) hint.hidden = first.value.length > 0;
  });
  first.addEventListener('compositionstart', () => {
    first.dataset.composing = 'true';
  });
  first.addEventListener('compositionend', () => {
    delete first.dataset.composing;
  });
  const select = (mode: string) => {
    first.dataset.mode = mode;
    for (const button of document.querySelectorAll<HTMLButtonElement>(
      '.first-modes button',
    ))
      button.setAttribute(
        'aria-selected',
        String(button.dataset.mode === mode),
      );
    first.focus();
  };
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    '.first-modes button',
  ))
    button.addEventListener('click', () =>
      select(button.dataset.mode ?? 'find'),
    );
  first.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && !first.value && !event.isComposing) {
      event.preventDefault();
      select(first.dataset.mode === 'do' ? 'find' : 'do');
    }
  });
}
