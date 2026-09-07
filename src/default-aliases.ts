import type { AliasesKey } from './types';

export const DEFAULT_ALIASES = {
  '+': 'plus',
  '-': 'minus',
  '*': 'asterisk',
  '/': 'solidus',
  '!': 'exclamation',
  '@': 'at',
  '#': 'hash',
  $: 'dollar',
  '%': 'percent',
  '^': 'caret',
  '&': 'amp',
  '(': 'leftparen',
  ')': 'rightparen',
  '=': 'equals',
  '.': 'period',
  ',': 'comma',
  '?': 'question',
  ':': 'colon'
} as const satisfies AliasesKey;
