import { DEFAULT_ALIASES } from './default-aliases';
import { DEFAULT_KEYS } from './default-keys';
import { parseCommand } from './parse-command';
import type {
  AliasesKey,
  AnyEventTarget,
  EventCallback,
  EventKey,
  EventShortcutAPI,
  EventShortcutInstance,
  EventShortcutOption
} from './types';

export function createEventShortcut<const Option extends Partial<EventShortcutOption> = {}>(
  option?: Option
) {
  const { defaultTarget = document, keys = DEFAULT_KEYS, aliases = DEFAULT_ALIASES } = option ?? {};

  function createCommandMatcher(
    command: string,
    keys: EventKey,
    aliases: AliasesKey,
    event: KeyboardEvent
  ) {
    const parsed = parseCommand(command);

    return function runMatcher(callback: EventCallback) {
      let run = true;

      for (const data of parsed) {
        if (data.type === 'KeyLiteral') {
          if (!(data.key in keys)) {
            throw new Error(`Command '${data.key}' does not registered.`);
          }

          if (!keys[data.key](event)) {
            run = false;

            break;
          }
        } else {
          run = data.set.some(char => {
            const key = char in aliases ? aliases[char] : char;

            if (!(key in keys)) {
              throw new Error(`Command '${key}' does not registered.`);
            }

            if (keys[key](event)) {
              return true;
            }
          });
        }
      }

      if (run) {
        callback(event);
      }
    };
  }

  function shortcut(...args: unknown[]) {
    if (args.length === 1 && typeof args[0] !== 'string') {
      return function lateShortcut(command: string, callback: EventCallback) {
        shortcut(command, callback, args[0]);
      };
    }

    const [command, callback, target = defaultTarget] = args as [
      string,
      EventCallback,
      AnyEventTarget
    ];

    target.addEventListener('keydown', event => {
      const matcher = createCommandMatcher(command, keys, aliases, event as KeyboardEvent);

      matcher(callback);
    });
  }

  const dispatch: EventShortcutAPI = () => {};
  const remove: EventShortcutAPI = () => {};

  return {
    shortcut,
    dispatch,
    remove
  } as any as EventShortcutInstance<
    {
      defaultTarget: typeof document;
      keys: typeof DEFAULT_KEYS;
      aliases: typeof DEFAULT_ALIASES;
    } & Option
  >;
}
