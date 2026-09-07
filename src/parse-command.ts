import type { KeyNode } from './types';

const CC_PLUS = 0x2b;
const CC_LEFT_SQUARE_BRACKET = 0x5b;
const CC_RIGHT_SQUARE_BRACKET = 0x5d;

const isWhitespace = (cp: number) => cp === 0x20;
const isKeyLiteral = (cp: number) => cp >= 0x61 && cp <= 0x7a;

export function parseCommand(value: string) {
  const nodes: KeyNode[] = [];

  let pos = 0;
  let lastKey = '';

  function checkSeparator() {
    if (value.codePointAt(pos) !== CC_PLUS) {
      if (pos + 1 <= value.length) {
        throw new Error(
          `Expected '+' after key ${lastKey[0] === '[' ? 'set' : 'literal'} '${lastKey}', but got '${value[pos]}' (${value.codePointAt(pos)}).`
        );
      }
    } else if (pos + 1 >= value.length) {
      throw new Error("This symbol '+' cannot be used at the end without key after it.");
    }
  }

  while (pos < value.length) {
    const cp = value.codePointAt(pos)!;

    if (cp === CC_PLUS) {
      throw new Error(`This symbol '+' cannot be used here at ${pos}.`);
    }

    if (isKeyLiteral(cp)) {
      let key = '';

      while (isKeyLiteral(value.codePointAt(pos)!)) {
        key += value[pos++];
      }

      lastKey = key;

      checkSeparator();

      pos++;

      nodes.push({
        type: 'KeyLiteral',
        key
      });

      continue;
    }

    if (cp === CC_LEFT_SQUARE_BRACKET) {
      const start = pos++;

      let set: string[] = [];

      while (true) {
        if (pos >= value.length) {
          throw new Error(
            `Unterminated set of keys started at ${start}, did you mean to close with ']'?`
          );
        }

        if (value.codePointAt(pos) === CC_RIGHT_SQUARE_BRACKET) {
          pos++;

          break;
        }

        set.push(value[pos++]);
      }

      lastKey = `[${set.join('')}]`;

      checkSeparator();

      pos++;

      nodes.push({
        type: 'KeySet',
        set
      });

      continue;
    }

    if (lastKey && (!isKeyLiteral(cp) || cp !== CC_LEFT_SQUARE_BRACKET)) {
      throw new Error(`Missing key after separator with previous key '${lastKey}' at ${pos}.`);
    }

    if (isWhitespace(cp)) {
      pos++;

      continue;
    }

    pos++;
  }

  return nodes;
}
