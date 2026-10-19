import type { FillContext, VaultItem } from './client';

export const fieldLabels = {
  username: 'Username',
  password: 'Password',
  'cc-name': 'Name on card',
  'cc-number': 'Card number',
  'cc-exp': 'Expiry',
  'cc-csc': 'Security code',
  'given-name': 'Given name',
  'family-name': 'Family name',
  email: 'Email address',
  tel: 'Phone number',
  'street-address': 'Address',
  organization: 'Organization',
} as const;
export type FieldKey = keyof typeof fieldLabels;
export type PageFillContext = FillContext & {
  category: 'login' | 'card' | 'identity';
  fields: { key: FieldKey; label: string }[];
};
export type SaveSuggestion = {
  suggestionToken: string;
  documentUrl: string;
  username: string;
  title: string;
};
export function fillValues(
  item: VaultItem,
  category: PageFillContext['category'],
  keys: FieldKey[],
) {
  if (item.state !== 'active' || item.category !== category)
    throw new Error('Choose an active item matching the selected fields.');
  if (item.reprompt)
    throw new Error(
      'This item requires a fresh password prompt, which page fill does not support yet.',
    );
  const values: Partial<Record<FieldKey, string>> = {};
  for (const key of keys) {
    const value =
      key === 'username'
        ? item.loginFields?.username
        : key === 'password'
          ? item.loginFields?.password
          : item.sections
              .flatMap((section) => section.fields)
              .find((field) => field.name === fieldLabels[key])?.value;
    if (typeof value !== 'string' || !value)
      throw new Error(`This item has no ${fieldLabels[key].toLowerCase()}.`);
    values[key] = value;
  }
  return values;
}
