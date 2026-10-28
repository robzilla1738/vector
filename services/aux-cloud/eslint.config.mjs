import next from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  { ignores: ['.next/**', 'next-env.d.ts', 'evidence/**', 'test-fixtures/**'] },
  ...next,
  ...typescript,
  { rules: {
    // Database rows come back untyped from the driver and are checked at the boundary.
    '@typescript-eslint/no-explicit-any': 'off',
    // `_`-prefixed names drop fields on purpose, as in `const {secret:_,...rest}=row`.
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', ignoreRestSiblings: true }],
    // Images are the small brand mark and data: URLs inside shared transcripts; next/image adds nothing.
    '@next/next/no-img-element': 'off',
  } },
];
export default config;
