export type EventKey = Record<string, (event: KeyboardEvent) => boolean>;

export type AliasesKey = Record<string, string>;

export type EventCallback = (event: KeyboardEvent) => void;

export type ShortcutMap = {
  keys: EventKey;
  aliases: AliasesKey;
};

export type KeyLiteral = {
  type: 'KeyLiteral';
  key: string;
};

export type KeySet = {
  type: 'KeySet';
  set: string[];
};

export type KeyNode = KeyLiteral | KeySet;

export type AnyEventTarget = Node | Element | Document | Window;

export type EventShortcutAPI = (value: number | ShortcutInstance) => void;

export type EventShortcutInstance<Option extends EventShortcutOption = EventShortcutOption> = {
  shortcut: ShortcutFunction<
    FixedRecordKeyof<Option['keys']>,
    FixedRecordKeyof<Option['aliases']>,
    Option['defaultTarget']
  >;
  dispatch: EventShortcutAPI;
  remove: EventShortcutAPI;
};

export type EventShortcutOption = {
  defaultTarget: AnyEventTarget;
  keys: EventKey;
  aliases: AliasesKey;
};

export type ShortcutFunction<
  Keys extends string[] = [],
  Aliases extends readonly string[] = [],
  DefaultTarget extends AnyEventTarget = AnyEventTarget
> = {
  <Target extends AnyEventTarget = DefaultTarget>(
    command: Keys[number] | `[${Aliases[number]}]`,
    callback: EventCallback,
    target?: Target
  ): ShortcutInstance<Target>;
  <Target extends AnyEventTarget = DefaultTarget>(
    command: string,
    callback: EventCallback,
    target?: Target
  ): ShortcutInstance<Target>;
  <Target extends AnyEventTarget = DefaultTarget>(
    target: Target
  ): ShortcutLateFunction<Keys, Aliases, Target>;
};

export type ShortcutLateFunction<
  Keys extends string[] = [],
  Aliases extends readonly string[] = [],
  Target extends AnyEventTarget = AnyEventTarget
> = {
  (
    command: Keys[number] | `[${Aliases[number]}]`,
    callback: EventCallback
  ): ShortcutInstance<Target>;
  (command: string, callback: EventCallback): ShortcutInstance<Target>;
};

export type ShortcutInstance<Target extends AnyEventTarget = AnyEventTarget> = {
  id: number;
  target: Target;
  dispatch(): void;
  remove(): void;
};

/** @internal */
export type FixedRecordKeyof<Obj extends Record<PropertyKey, any>> =
  Obj extends Record<infer Key extends string, any> ? Key[] : never;
