import { DEFAULT_ALIASES } from './default-aliases';
import { DEFAULT_KEYS } from './default-keys';
import { parseCommand } from './parse-command';
import type {
  AliasesKey,
  AnyEventTarget,
  EventCallback,
  EventKey,
  EventShortcutInstance,
  EventShortcutOption,
  ShortcutInstance
} from './types';

type EventPredicate = (event: KeyboardEvent) => boolean;

type ResolvedKeyLiteral = {
  type: 'KeyLiteral';
  key: string;
  predicate: EventPredicate;
};

type ResolvedKeySet = {
  type: 'KeySet';
  members: string[];
  predicates: EventPredicate[];
};

type ResolvedNode = ResolvedKeyLiteral | ResolvedKeySet;

type Handler = {
  id: number;
  command: string;
  nodes: ResolvedNode[];
  callback: EventCallback;
};

function validateRegistry(keys: EventKey, aliases: AliasesKey) {
  for (const [name, predicate] of Object.entries(keys)) {
    if (typeof predicate !== 'function') {
      throw new Error(`Key '${name}' must be a predicate function.`);
    }
  }

  for (const [char, key] of Object.entries(aliases)) {
    if (!(key in keys)) {
      throw new Error(`Alias '${char}' maps to unregistered key '${key}'.`);
    }
  }
}

export function createEventShortcut<const Option extends Partial<EventShortcutOption> = {}>(
  option?: Option
) {
  const {
    defaultTarget = document,
    keys = DEFAULT_KEYS,
    aliases = DEFAULT_ALIASES
  }: {
    defaultTarget?: AnyEventTarget;
    keys?: EventKey;
    aliases?: AliasesKey;
  } = option ?? {};

  validateRegistry(keys, aliases);

  function resolveKey(name: string): EventPredicate {
    const key = name in aliases ? aliases[name] : name;
    const predicate = keys[key];

    if (!predicate) {
      throw new Error(`Command '${name}' does not registered.`);
    }

    return predicate;
  }

  function resolveCommand(command: string): ResolvedNode[] {
    return parseCommand(command).map(data => {
      if (data.type === 'KeyLiteral') {
        return {
          type: 'KeyLiteral',
          key: data.key,
          predicate: resolveKey(data.key)
        };
      }

      return {
        type: 'KeySet',
        members: data.set,
        predicates: data.set.map(resolveKey)
      };
    });
  }

  function match(nodes: ResolvedNode[], event: KeyboardEvent): string[] | null {
    const parts: string[] = [];

    for (const node of nodes) {
      if (node.type === 'KeyLiteral') {
        if (!node.predicate(event)) {
          return null;
        }

        parts.push(node.key);
      } else {
        const index = node.predicates.findIndex(predicate => predicate(event));

        if (index === -1) {
          return null;
        }

        parts.push(node.members[index]);
      }
    }

    return parts;
  }

  const handlers = new Map<AnyEventTarget, Handler[]>();

  let lastId = 0;

  function onKeyDown(event: Event) {
    const target = event.currentTarget as AnyEventTarget;
    const list = handlers.get(target);

    if (!list) {
      return;
    }

    const keyboardEvent = event as KeyboardEvent;

    for (const handler of [...list]) {
      const matched = match(handler.nodes, keyboardEvent);

      if (matched) {
        handler.callback({
          command: handler.command,
          event: keyboardEvent,
          matched
        });
      }
    }
  }

  function findHandler(value: number | ShortcutInstance): Handler | undefined {
    const id = typeof value === 'number' ? value : value.id;

    for (const list of handlers.values()) {
      const handler = list.find(handler => handler.id === id);

      if (handler) {
        return handler;
      }
    }

    return undefined;
  }

  function addHandler(
    command: string,
    callback: EventCallback,
    target: AnyEventTarget
  ): ShortcutInstance<AnyEventTarget> {
    const id = ++lastId;
    const list = handlers.get(target) ?? [];

    list.push({ id, command, nodes: resolveCommand(command), callback });
    handlers.set(target, list);

    if (list.length === 1) {
      target.addEventListener('keydown', onKeyDown);
    }

    return {
      id,
      target,
      dispatch: () => dispatch(id),
      remove: () => remove(id)
    };
  }

  function shortcut(...args: unknown[]) {
    if (args.length === 1 && typeof args[0] !== 'string') {
      return function lateShortcut(command: string, callback: EventCallback) {
        return shortcut(command, callback, args[0]);
      };
    }

    const [command, callback, target = defaultTarget] = args as [
      string,
      EventCallback,
      AnyEventTarget
    ];

    return addHandler(command, callback, target);
  }

  function dispatch(value: number | ShortcutInstance) {
    const handler = findHandler(value);

    if (!handler) {
      return;
    }

    handler.callback({
      command: handler.command,
      event: new KeyboardEvent('keydown', { bubbles: true })
    });
  }

  function remove(value: number | ShortcutInstance) {
    const id = typeof value === 'number' ? value : value.id;

    for (const [target, list] of handlers) {
      const next = list.filter(handler => handler.id !== id);

      if (next.length !== list.length) {
        handlers.set(target, next);

        if (next.length === 0) {
          handlers.delete(target);
          target.removeEventListener('keydown', onKeyDown);
        }

        return;
      }
    }
  }

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
