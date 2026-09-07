export type EventKey = Record<string, (event: KeyboardEvent) => boolean>;

export type KeyPredicate = (event: KeyboardEvent) => boolean;

export type AliasesKey = Record<string, string>;

export type EventCallbackMeta<Command extends string = string, Match extends string = string> = {
  command: Command;
  event: KeyboardEvent;
  matched?: Match[];
};

export type EventCallback<Command extends string = string, Match extends string = string> = (
  event: EventCallbackMeta<Command, Match>
) => void;

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
  Aliases extends string[] = [],
  DefaultTarget extends AnyEventTarget = AnyEventTarget
> = {
  <Command extends GetCommand<Keys, Aliases>, Target extends AnyEventTarget = DefaultTarget>(
    command: Command,
    callback: EventCallback<Command, Keys[number]>,
    target?: Target
  ): ShortcutInstance<Target>;
  <Command extends string, Target extends AnyEventTarget = DefaultTarget>(
    command: Command,
    callback: EventCallback<Command, Keys[number]>,
    target?: Target
  ): ShortcutInstance<Target>;
  <Target extends AnyEventTarget = DefaultTarget>(
    target: Target
  ): ShortcutLateFunction<Keys, Aliases, Target>;
};

export type ShortcutLateFunction<
  Keys extends string[] = [],
  Aliases extends string[] = [],
  Target extends AnyEventTarget = AnyEventTarget
> = {
  <Command extends GetCommand<Keys, Aliases>>(
    command: Command,
    callback: EventCallback<Command, Keys[number]>
  ): ShortcutInstance<Target>;
  <Command extends string>(
    command: Command,
    callback: EventCallback<Command, Keys[number]>
  ): ShortcutInstance<Target>;
};

export type ShortcutInstance<Target extends AnyEventTarget = AnyEventTarget> = {
  id: number;
  target: Target;
  dispatch(): void;
  remove(): void;
};

/** @internal */
export type FixedRecordKeyof<Obj extends Record<string, any>> = (keyof Obj & string)[];

/** @internal */
export type GetCommand<Keys extends string[] = [], Aliases extends string[] = []> =
  Keys[number] | `[${Aliases[number]}]`;
