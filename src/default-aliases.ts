import type { AliasesKey } from './types';

export const DEFAULT_ALIASES = {
  '+': 'plus',
  '-': 'minus',
  '*': 'asterisk',
  '/': 'solidus'
} as const satisfies AliasesKey;
