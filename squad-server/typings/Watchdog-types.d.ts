import { EventEmitter } from 'node:events';

import './DiscordJSTypes.d.ts';

type Constructable<T> = new (...args: any[]) => T;

/**
 * https://discord.com/developers/docs/reference#snowflakes
 */
export type Snowflake = string;

/**
 * Wraps the content inside a code block with no language.
 *
 * @typeParam Content - This is inferred by the supplied content
 * @param content - The content to wrap
 */
export function codeBlock<Content extends string>(content: Content): `\`\`\`\n${Content}\n\`\`\``;

/**
 * Wraps the content inside a code block with the specified language.
 *
 * @typeParam Language - This is inferred by the supplied language
 * @typeParam Content - This is inferred by the supplied content
 * @param language - The language for the code block
 * @param content - The content to wrap
 */
export function codeBlock<Language extends string, Content extends string>(
	language: Language,
	content: Content,
): `\`\`\`${Language}\n${Content}\n\`\`\``;

export function codeBlock(language: string, content?: string): string {
	return content === undefined ? `\`\`\`\n${language}\n\`\`\`` : `\`\`\`${language}\n${content}\n\`\`\``;
}

/**
 * Formats a non-animated emoji id into a fully qualified emoji identifier.
 *
 * @typeParam EmojiId - This is inferred by the supplied emoji id
 * @param emojiId - The emoji id to format
 */
export function formatEmoji<EmojiId extends Snowflake>(emojiId: EmojiId, animated?: false): `<:_:${EmojiId}>`;

/**
 * Formats an animated emoji id into a fully qualified emoji identifier.
 *
 * @typeParam EmojiId - This is inferred by the supplied emoji id
 * @param emojiId - The emoji id to format
 * @param animated - Whether the emoji is animated
 */
export function formatEmoji<EmojiId extends Snowflake>(emojiId: EmojiId, animated?: true): `<a:_:${EmojiId}>`;

/**
 * Formats an emoji id into a fully qualified emoji identifier.
 *
 * @typeParam EmojiId - This is inferred by the supplied emoji id
 * @param emojiId - The emoji id to format
 * @param animated - Whether the emoji is animated
 */
export function formatEmoji<EmojiId extends Snowflake>(
	emojiId: EmojiId,
	animated?: boolean,
): `<:_:${EmojiId}>` | `<a:_:${EmojiId}>`;

/**
 * Formats a non-animated emoji id and name into a fully qualified emoji identifier.
 *
 * @typeParam EmojiId - This is inferred by the supplied emoji id
 * @typeParam EmojiName - This is inferred by the supplied name
 * @param options - The options for formatting an emoji
 */
export function formatEmoji<EmojiId extends Snowflake, EmojiName extends string>(
	options: FormatEmojiOptions<EmojiId, EmojiName> & { animated: true },
): `<a:${EmojiName}:${EmojiId}>`;

/**
 * Formats an animated emoji id and name into a fully qualified emoji identifier.
 *
 * @typeParam EmojiId - This is inferred by the supplied emoji id
 * @typeParam EmojiName - This is inferred by the supplied name
 * @param options - The options for formatting an emoji
 */
export function formatEmoji<EmojiId extends Snowflake, EmojiName extends string>(
	options: FormatEmojiOptions<EmojiId, EmojiName> & { animated?: false },
): `<:${EmojiName}:${EmojiId}>`;

/**
 * Formats an emoji id and name into a fully qualified emoji identifier.
 *
 * @typeParam EmojiId - This is inferred by the supplied emoji id
 * @typeParam EmojiName - This is inferred by the supplied emoji name
 * @param options - The options for formatting an emoji
 */
export function formatEmoji<EmojiId extends Snowflake, EmojiName extends string>(
	options: FormatEmojiOptions<EmojiId, EmojiName>,
): `<:${EmojiName}:${EmojiId}>` | `<a:${EmojiName}:${EmojiId}>`;

export function formatEmoji<EmojiId extends Snowflake, EmojiName extends string>(
	emojiIdOrOptions: EmojiId | FormatEmojiOptions<EmojiId, EmojiName>,
	animated?: boolean,
): `<:${string}:${EmojiId}>` | `<a:${string}:${EmojiId}>` {
	const options =
		typeof emojiIdOrOptions === 'string'
			? {
					id: emojiIdOrOptions,
					animated: animated ?? false,
				}
			: emojiIdOrOptions;

	const { id, animated: isAnimated, name: emojiName } = options;

	return `<${isAnimated ? 'a' : ''}:${emojiName ?? '_'}:${id}>`;
}

/**
 * The options for formatting an emoji.
 *
 * @typeParam EmojiId - This is inferred by the supplied emoji id
 * @typeParam EmojiName - This is inferred by the supplied emoji name
 */
export interface FormatEmojiOptions<EmojiId extends Snowflake, EmojiName extends string> {
	/**
	 * Whether the emoji is animated
	 */
	animated?: boolean;
	/**
	 * The emoji id to format
	 */
	id: EmojiId;
	/**
	 * The name of the emoji
	 */
	name?: EmojiName;
}

/**
 * Formats a channel link for a direct message channel.
 *
 * @typeParam ChannelId - This is inferred by the supplied channel id
 * @param channelId - The channel's id
 */
export function channelLink<ChannelId extends Snowflake>(
	channelId: ChannelId,
): `https://discord.com/channels/@me/${ChannelId}`;

/**
 * Formats a channel link for a guild channel.
 *
 * @typeParam ChannelId - This is inferred by the supplied channel id
 * @typeParam GuildId - This is inferred by the supplied guild id
 * @param channelId - The channel's id
 * @param guildId - The guild's id
 */
export function channelLink<ChannelId extends Snowflake, GuildId extends Snowflake>(
	channelId: ChannelId,
	guildId: GuildId,
): `https://discord.com/channels/${GuildId}/${ChannelId}`;

export function channelLink<ChannelId extends Snowflake, GuildId extends Snowflake>(
	channelId: ChannelId,
	guildId?: GuildId,
): `https://discord.com/channels/@me/${ChannelId}` | `https://discord.com/channels/${GuildId}/${ChannelId}` {
	return `https://discord.com/channels/${guildId ?? '@me'}/${channelId}`;
}

/**
 * Formats a message link for a direct message channel.
 *
 * @typeParam ChannelId - This is inferred by the supplied channel id
 * @typeParam MessageId - This is inferred by the supplied message id
 * @param channelId - The channel's id
 * @param messageId - The message's id
 */
export function messageLink<ChannelId extends Snowflake, MessageId extends Snowflake>(
	channelId: ChannelId,
	messageId: MessageId,
): `https://discord.com/channels/@me/${ChannelId}/${MessageId}`;

/**
 * Formats a message link for a guild channel.
 *
 * @typeParam ChannelId - This is inferred by the supplied channel id
 * @typeParam MessageId - This is inferred by the supplied message id
 * @typeParam GuildId - This is inferred by the supplied guild id
 * @param channelId - The channel's id
 * @param messageId - The message's id
 * @param guildId - The guild's id
 */
export function messageLink<ChannelId extends Snowflake, MessageId extends Snowflake, GuildId extends Snowflake>(
	channelId: ChannelId,
	messageId: MessageId,
	guildId: GuildId,
): `https://discord.com/channels/${GuildId}/${ChannelId}/${MessageId}`;

export function messageLink<ChannelId extends Snowflake, MessageId extends Snowflake, GuildId extends Snowflake>(
	channelId: ChannelId,
	messageId: MessageId,
	guildId?: GuildId,
):
	| `https://discord.com/channels/@me/${ChannelId}/${MessageId}`
	| `https://discord.com/channels/${GuildId}/${ChannelId}/${MessageId}` {
	return `${guildId === undefined ? channelLink(channelId) : channelLink(channelId, guildId)}/${messageId}`;
}

/**
 * Formats the content into bold text.
 *
 * @typeParam Content - This is inferred by the supplied content
 * @param content - The content to wrap
 */
export function bold<Content extends string>(content: Content): `**${Content}**` {
  return `**${content}**`;
}

/**
 * Wraps the content inside \`backticks\` which formats it as inline code.
 *
 * @typeParam Content - This is inferred by the supplied content
 * @param content - The content to wrap
 */
export function inlineCode<Content extends string>(content: Content): `\`${Content}\`` {
  return `\`${content}\``;
}

/**
 * Formats the content and the URL into a masked URL.
 *
 * @typeParam Content - This is inferred by the supplied content
 * @param content - The content to display
 * @param url - The URL the content links to
 */
export function hyperlink<Content extends string>(content: Content, url: URL): `[${Content}](${string})`;

/**
 * Formats the content and the URL into a masked URL.
 *
 * @typeParam Content - This is inferred by the supplied content
 * @typeParam Url - This is inferred by the supplied URL
 * @param content - The content to display
 * @param url - The URL the content links to
 */
export function hyperlink<Content extends string, Url extends string>(
  content: Content,
  url: Url
): `[${Content}](${Url})`;

/**
 * Formats the content and the URL into a masked URL with a custom tooltip.
 *
 * @typeParam Content - This is inferred by the supplied content
 * @typeParam Title - This is inferred by the supplied title
 * @param content - The content to display
 * @param url - The URL the content links to
 * @param title - The title shown when hovering on the masked link
 */
export function hyperlink<Content extends string, Title extends string>(
  content: Content,
  url: URL,
  title: Title
): `[${Content}](${string} "${Title}")`;

/**
 * Formats the content and the URL into a masked URL with a custom tooltip.
 *
 * @typeParam Content - This is inferred by the supplied content
 * @typeParam Url - This is inferred by the supplied URL
 * @typeParam Title - This is inferred by the supplied title
 * @param content - The content to display
 * @param url - The URL the content links to
 * @param title - The title shown when hovering on the masked link
 */
export function hyperlink<Content extends string, Url extends string, Title extends string>(
  content: Content,
  url: Url,
  title: Title
): `[${Content}](${Url} "${Title}")`;

export function hyperlink(content: string, url: URL | string, title?: string) {
  return title ? `[${content}](${url} "${title}")` : `[${content}](${url})`;
}

/**
 * Formats a date into a short date-time string.
 *
 * @param date - The date to format. Defaults to the current time
 */
export function time(date?: Date): `<t:${bigint}>`;

/**
 * Formats a date given a format style.
 *
 * @typeParam Style - This is inferred by the supplied {@link TimestampStylesString}
 * @param date - The date to format
 * @param style - The style to use
 */
export function time<Style extends TimestampStylesString>(
  date: Date,
  style: Style
): `<t:${bigint}:${Style}>`;

/**
 * Formats the given timestamp into a short date-time string.
 *
 * @typeParam Seconds - This is inferred by the supplied timestamp
 * @param seconds - A Unix timestamp in seconds
 */
export function time<Seconds extends number>(seconds: Seconds): `<t:${Seconds}>`;

/**
 * Formats the given timestamp into a short date-time string.
 *
 * @typeParam Seconds - This is inferred by the supplied timestamp
 * @typeParam Style - This is inferred by the supplied {@link TimestampStylesString}
 * @param seconds - A Unix timestamp in seconds
 * @param style - The style to use
 */
export function time<Seconds extends number, Style extends TimestampStylesString>(
  seconds: Seconds,
  style: Style
): `<t:${Seconds}:${Style}>`;

export function time(timeOrSeconds?: Date | number, style?: TimestampStylesString): string {
  if (typeof timeOrSeconds !== 'number') {
    // eslint-disable-next-line no-param-reassign
    timeOrSeconds = Math.floor((timeOrSeconds?.getTime() ?? Date.now()) / 1_000);
  }

  return typeof style === 'string' ? `<t:${timeOrSeconds}:${style}>` : `<t:${timeOrSeconds}>`;
}

/**
 * The {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles | message formatting timestamp styles}
 * supported by Discord.
 */
export const TimestampStyles = {
  /**
   * Short time format, consisting of hours and minutes.
   *
   * @example `16:20`
   */
  ShortTime: 't',

  /**
   * Long time format, consisting of hours, minutes, and seconds.
   *
   * @example `16:20:30`
   */
  LongTime: 'T',

  /**
   * Short date format, consisting of day, month, and year.
   *
   * @example `20/04/2021`
   */
  ShortDate: 'd',

  /**
   * Long date format, consisting of day, month, and year.
   *
   * @example `20 April 2021`
   */
  LongDate: 'D',

  /**
   * Short date-time format, consisting of short date and short time formats.
   *
   * @example `20 April 2021 16:20`
   */
  ShortDateTime: 'f',

  /**
   * Long date-time format, consisting of long date and short time formats.
   *
   * @example `Tuesday, 20 April 2021 16:20`
   */
  LongDateTime: 'F',

  /**
   * Relative time format, consisting of a relative duration format.
   *
   * @example `2 months ago`
   */
  RelativeTime: 'R'
} as const satisfies Record<string, string>;

/**
 * The possible {@link TimestampStyles} values.
 */
export type TimestampStylesString = (typeof TimestampStyles)[keyof typeof TimestampStyles];

type embedInfoDefaults = {
  clan: 'Watchdog ';
  name: 'Rover';
  iconURL: null;
  url: null;
  format: {
    player: "[[{{name}}](https://www.battlemetrics.com/rcon/players?filter[search]={{eosID}}&method=quick&redirect=1 'Go to BattleMetrics')] - [[{{steamID}}](https://steamcommunity.com/profiles/{{steamID}} 'Go to Steam Profile')]";
    squad: '{{squadID}} : {{squadName}}';
    team: '{{teamID}} : {{teamName}}';
  };
};

type TextData<T> = {
  bsDetect: boolean;
  clean: string;
  code: {
    data: string[];
    raw: string[];
    spaces: string[];
    unicode: {
      code: string;
      raw: string;
    }[];
  };
  data: string;
  raw: T;
};
type channelObject = {
  channel: Discord.TextChannel;
  id: string;
};
type DiscordFormatters = {
  bold: typeof bold;
  codeBlock: typeof codeBlock;
  channelLink: typeof channelLink;
  formatEmoji: typeof formatEmoji;
  hyperlink: typeof hyperlink;
  inlineCode: typeof inlineCode;
  messageLink: typeof messageLink;
  time: typeof time;
};

interface BasePlugin {}

interface WatchdogBase extends BasePlugin {}

/**
 * Base framework for all SquadJS plugins
 */
class BasePlugin {
  server: EventEmitter;
  options: {};
  rawOptions: BasePlugin['options'];

  constructor(server: any, options: any, connectors: any);

  prepareToMount(): Promise<void>;

  mount(): Promise<void>;

  unmount(): Promise<void>;

  static get description(): void;

  static get defaultEnabled(): void;

  static get optionsSpecification(): void;

  verbose(...args: any[]): void;
}

/**
 * Base plugin for all watchdogs
 */
class WatchdogBase extends BasePlugin {
  static get description(): 'Watchdog, the most advanced content filter in SquadJS';

  static get defaultEnabled(): true;

  static get optionsSpecification(): {
    discordClient: {
      required: true;
      description: 'Discord connector name.';
      connector: 'discord';
      default: 'discord';
    };
    action: {
      required: false;
      description: 'If you do not want the watchdog to auto ban/kick players';
      default: 'none';
      example: 'kick';
    };
    playerNames: {
      required: false;
      description: 'Used to filter player names';
      default: {
        action: 'none';
        alphabet: 'abcdefghijklmnopqrstuvwxyz1234567890';
        extends: '';
        minimum: 0;
      };
      example: {
        action: 'kick';
        alphabet: 'abcdefghijklmnopqrstuvwxyz';
        extends: '1234567890';
        minimum: 2;
      };
    };
    embedInfo: {
      required: false;
      description: 'Server info for embed messages.';
      default: embedInfoDefaults;
      example: {
        clan: '[SquadJS] ';
        name: 'Rover';
        iconURL: '<Image URL>';
        url: 'https://www.battlemetrics.com/servers/squad/<Server ID>';
        format: {
          player: '[{{name}}](https://steamcommunity.com/profiles/{{steamID}})';
          squad: '({{squadID}}) - {{squadName}}';
          team: '({{teamID}}) - {{teamName}}';
        };
      };
    };
    profanity: {
      required: false;
      description: 'An array of words';
      default: [];
      example: ['butts', 'weed'];
    };
    lineBreaks: {
      required: false;
      description: 'Specify "spaces", used in `this.getData().clean`';
      default: ['\f', '\t', '\n', '\r', '\x20', '\v', '\0'];
      /**
       * Only count spacebar => '\x20' or ' '
       */
      example: ['\x20'];
    };
    ignorePoints: {
      required: false;
      description: 'Specify ignore characters, used in `this.getData().clean` and `this.getData().data`';
      default: [
        '!',
        '@',
        '#',
        '%',
        '&',
        ';',
        '+',
        '*',
        '?',
        '^',
        '$',
        '.',
        '[',
        ']',
        '{',
        '}',
        '(',
        ')',
        '|',
        '/',
        '\\',
        ',',
        '\f',
        '\t',
        '\n',
        '\r',
        '\v',
        '\0'
      ];
      example: ['\t']; // Only remove tab character codes
    };
  };

  constructor(server: any, options: any, connectors: any);

  format: DiscordFormatters;
  discordClient: Discord.Client;
  action: string | 'kick';
  playerNames: {
    action: 'kick';
    alphabet: 'abcdefghijklmnopqrstuvwxyz1234567890';
    extends: '';
    minimum: 0;
  };
  loadChannels: any[];
  embedInfo: embedInfoDefaults;
  alphabet: string[];
  rawLineBreaks: string[];
  rawIgnorePoints: string[];
  lineBreaks: string[];
  ignorePoints: string[];
  profanity: string[];
  channels: Map<string, channelObject>;

  fetchChannels<C extends string>(channels: C[] = []): Promise<WatchdogBase['channels']>;

  /**
   * Send message to connected Discord server.
   * @param message Message to send.
   * @param labels Channel ID or label.
   * @example <caption>Example usage</caption>
   * const message = { content: 'What da dog doin?' }; // Message body.
   * await this.sendDiscordMessage(message); // Send message to the first channel from `this.channel`.
   * await this.sendDiscordMessage(message, 'snoopdog'); // Send message to the specified channel.
   * await this.sendDiscordMessage(message, '667741905228136459'); // Send message to the specified channel id.
   * await this.sendDiscordMessage(message, true); // Send message to all channels.
   */
  sendDiscordMessage<M extends Discord.Message>(
    message: M,
    labels: string | string[] | boolean
  ): Promise<Discord.Message[]>;

  setObj<A, B>(objA: A = {}, objB: B = {}): B;

  alphabetSoup<S extends string>(str: S = ''): boolean;

  /**
   * Bind multiple functions to one listener or bind multiple listeners to one function.
   */
  on<E extends string | string[]>(events: E, ...callbacks: Function[]): void;

  fowlText<S extends string>(str: S = ''): S[] | any[];

  /**
   * Get hexadecimal Unicode code from number or string.
   */
  getUniHex<N extends number | string>(num: N): N;

  getData<S extends string>(str: S = ''): TextData<S>;

  fowlData<S extends string>(raw: S = '', badSlurs: { [key: string]: RegExp }): {
    bsDetect: boolean;
    clean: string;
    code: {
      data: string[];
      raw: string[];
      spaces: string[];
      unicode: {
        code: string;
        raw: string;
      }[];
    };
    data: string;
    regexp: RegExp;
    type: string;
    matched: string;
    raw: S;
  };

  clrSpaces<S extends string>(str: S = ''): string;

  badSlurCheck(str: string, badSlurs: object): { matched: RegExpMatchArray; type: null | string };

  toxicityCheck(str: string, profanity: string): boolean;

  toxicityMatch(str: string, profanity: string): RegExpMatchArray | string[];

  /**
   * Replace `/[^a-z0-9\s]|\s{2,}/g`
   */
  trimMsg<S>(str: S): S;

  msgMatch<S extends string>(
    rawMessage: string,
    matchReg: RegExp,
    type: S = 'Slur'
  ): { matched: string; type: S | null };

  /**
   * Get the code point value of a string then turn that value back into a string.
   */
  static toCodePoint(s: string): string;

  /**
   * Returns a string representation of an object.
   */
  objToStr<O>(obj: O): string;

  /**
   * This functions JSDoc tags are not fully accurate
   *
   * Transform `target` into an array, if `target` is already an array, return unmodified `target`.
   */
  normalizeTarget<T>(target: T): T[];

  /**
   * Object is typeof `object` / JSON Object
   */
  isObj<O>(obj: O, pos: number = undefined): boolean;

  /**
   * Object is `null` or `undefined`
   */
  isNull<O>(obj: O): boolean;

  /**
   * Object is Blank
   *
   * Object can be `Array`, `Map`, `Object`, `String`, `Set`
   */
  isBlank<O>(obj: O): boolean;

  /**
   * Object is Empty
   *
   * Tests object through `this.isNull` and `this.isBlank`
   */
  isEmpty<O>(obj: O): boolean;

  // #region Formatters
  /**
   * Polyfill discord.js v14 formatters
   */
  formatters(): DiscordFormatters;
  // #endregion

  validator<O = {}>(obj: O = {}, locate: string = ''): keyof O | null;

  /**
   * @param info - Root object
   * @param template - String template
   * @param bol - Return template if invalid
   * @returns Returns boolean, template, or value of template if valid
   * ```js
   * this.isValid(info, '{{steamID}}'); // Returns '76774190522813645'
   * this.isValid(info, 'steamID'); // Returns '76774190522813645'
   * this.isValid(info.squadID, '{{steamID}}'); // Returns '{{steamID}}'
   * this.isValid(info.squadID, 'steamID'); // Returns false
   * ```
   */
  isValid<O = {}>(info: O = {}, template: string = '', bol: boolean = true): keyof O | null;

  /**
   * Locate player name within an object
   */
  validName<I>(info: I): string | I;

  embedFormat<N>(name: N): string;

  validSquad<I>(info: I): I;

  validSteamID<I>(info: I): I;

  validTeam<I>(info: I): I;

  // #region Console Logs
  dbg(...msg: any[]): void;

  err(...msg: string[]): void;

  log(...msg: string[]): void;

  /**
   * Type is not 100% accurate but it is the best I can do for now.
   */
  prettyPrint<Content extends string>(content: Content): `[Watchdog][${Content}][1]`;
  // #endregion
}



namespace Watchdog {
  export { Watchdog };
}
