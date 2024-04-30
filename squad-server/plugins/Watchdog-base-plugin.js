import BasePlugin from './base-plugin.js';
import chalk from 'chalk';
import { COPYRIGHT_MESSAGE } from '../utils/constants.js';

/**
 * @typedef { import('../typings/Watchdog-types.d.ts').WatchdogBase } WDB
 */

/**
 * If you wish to use `[[string]]` or replace it with your own format.
 *
 * ```js
 * const templateReg = /\[\[(.*?)\]\]/g;
 * ```
 */
const templateReg = /\{\{(.*?)\}\}/g;

/**
 * Exemptions
 * @description Words exempted from content filter
 */
const exemptions = /(niba|miga|dink|jewoine|cannibal)\b/gi;

const embedFormatDefaults = {
  player:
    "[[{{name}}](https://www.battlemetrics.com/rcon/players?filter[search]={{eosID}}&method=quick&redirect=1 'Go to BattleMetrics')] - [[{{steamID}}](https://steamcommunity.com/profiles/{{steamID}} 'Go to Steam Profile')]",
  squad: '{{squadID}} : {{squadName}}',
  team: '{{teamID}} : {{teamName}}'
};
/**
 * @type { WDB }
 */
class WatchdogBase extends BasePlugin {
  static get description() {
    return 'Watchdog, the most advanced content filter in SquadJS';
  }

  static get defaultEnabled() {
    return true;
  }

  static get optionsSpecification() {
    return {
      discordClient: {
        required: true,
        description: 'Discord connector name.',
        connector: 'discord',
        default: 'discord'
      },
      action: {
        required: false,
        description: 'If you do not want the watchdog to auto ban/kick players',
        default: 'none',
        example: 'kick'
      },
      playerNames: {
        required: false,
        description: 'Used to filter player names',
        default: {
          action: 'none',
          alphabet: 'abcdefghijklmnopqrstuvwxyz1234567890',
          extends: '',
          minimum: 0
        },
        example: {
          action: 'kick',
          alphabet: 'abcdefghijklmnopqrstuvwxyz',
          extends: '1234567890',
          minimum: 2
        }
      },
      embedFormat: {
        required: false,
        description: 'Formats for embed messages.',
        default: embedFormatDefaults,
        example: {
          player: '[{{name}}](https://steamcommunity.com/profiles/{{steamID}})',
          squad: '({{squadID}}) - {{squadName}}',
          team: '({{teamID}}) - {{teamName}}'
        }
      },
      profanity: {
        required: false,
        description: 'An array of words',
        default: [],
        example: ['butts', 'weed']
      },
      lineBreaks: {
        required: false,
        description: 'Specify "spaces", used in `this.getData().clean`',
        default: ['\f', '\t', '\n', '\r', '\x20', '\v', '\0'],
        example: ['\x20'] // Only count spacebar => '\x20' or ' '
      },
      ignorePoints: {
        required: false,
        description:
          'Specify ignore characters, used in `this.getData().clean` and `this.getData().data`',
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
        ],
        example: ['\t'] // Only remove tab character codes
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.dbg = this.dbg.bind(this);
    this.err = this.err.bind(this);
    this.log = this.log.bind(this);
    // this.fetchChannels = this.fetchChannels.bind(this);
    this.sendDiscordMessage = this.sendDiscordMessage.bind(this);
    this.getUniHex = this.getUniHex.bind(this);
    this.getData = this.getData.bind(this);
    this.formatters = this.formatters.bind(this);

    this.format = this.formatters();
    this.discordClient = this.options.discordClient;
    this.action = this.options.action ?? 'kick';
    this.playerNames = this.options.playerNames ?? {
      action: 'kick',
      alphabet: 'abcdefghijklmnopqrstuvwxyz1234567890',
      extends: '',
      minimum: 0
    };

    this.loadChannels =
      'channelID' in options
        ? options.channelID
        : 'channelIDs' in options
        ? options.channelIDs
        : null;

    this.embedFormats = this.setObj(embedFormatDefaults, this.options.embedFormat ?? {});
    this.alphabet = [...this.playerNames.alphabet, ...this.playerNames.extends].map(
      WatchdogBase.toCodePoint
    );
    this.rawLineBreaks = this.options.lineBreaks ?? ['\f', '\t', '\n', '\r', '\x20', '\v', '\0'];
    this.rawIgnorePoints = this.options.ignorePoints ?? [
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
    this.lineBreaks = this.rawLineBreaks.map(WatchdogBase.toCodePoint);
    this.ignorePoints = this.rawIgnorePoints.map(WatchdogBase.toCodePoint);
    this.profanity = this.options.profanity ?? [];
    this.channels = new Map();
  }

  async prepareToMount() {
    await this.fetchChannels(this.loadChannels);
  }

  async mount() {}

  /**
   * @type { WDB["fetchChannels"] }
   */
  async fetchChannels(channels = []) {
    let channel;
    try {
      for (const obj of this.normalizeTarget(channels)) {
        try {
          if (typeof obj === 'string') {
            channel = await this.discordClient.channels.fetch(obj);
            if (!this.channels.has(obj)) {
              this.channels.set(obj, {
                channel,
                id: obj
              });
            }
            continue;
          }
          const useChannelName = obj.useChannelName && obj.useChannelName === true;
          if (typeof obj.id !== 'string') {
            throw new Error('"id" must be a typeof String', { cause: 'loadChannels' });
          }
          if (!useChannelName && typeof obj.label !== 'string') {
            throw new Error('"label" must be a typeof String', { cause: 'loadChannels' });
          }
          channel = await this.discordClient.channels.fetch(obj.id);
          if (useChannelName) {
            obj.label = channel.name;
          }
          this.channels.set(obj.label, {
            channel,
            ...obj
          });
        } catch (ex) {
          const caused = 'cause' in ex ? `[${ex.cause}] ` : '';
          this.err(
            `${caused}Could not fetch Discord channel "${JSON.stringify(obj)}", ${ex.message}`
          );
          this.err(`${ex.stack}`);
        }
      }
    } catch (e) {
      this.err(e);
    }
    this.log(`Discord channels loaded: ${this.channels.size}`);
    return this.channels;
  }

  /**
   * @type { WDB["sendDiscordMessage"] }
   */
  async sendDiscordMessage(message, labels) {
    const toSend = [];
    try {
      if (this.isEmpty(message)) {
        this.log('Could not send Discord Message, message is empty.');
        return;
      }
      /**
       * @returns { import('./Watchdog-types.d.ts').channelObject["channel"][] }
       */
      const getDiscordChannel = () => {
        const cLabels = [];
        const response = [];
        try {
          if (this.isBlank(this.channels)) {
            this.log('Could not send Discord Message. Channels not initialized.');
            return response;
          }
          if (this.isEmpty(labels) && this.channels.size === 1) {
            cLabels.push('default');
          } else if (typeof labels === 'string') {
            cLabels.push(labels);
          } else if (Array.isArray(labels)) {
            cLabels.push(...labels);
          } else if (labels === true) {
            cLabels.push(...[...this.channels.values()].filter((c) => c.label).map((c) => c.label));
          } else {
            cLabels.push([...this.channels.values()].at(0).label);
          }
          for (const label of cLabels) {
            if (label === 'default') {
              const c = [...this.channels.values()].at(0);
              if (this.isEmpty(c.channel)) {
                this.log('Could not get Discord channel, channel is not initialized.', label);
                break;
              }
              response.push(c.channel);
              continue;
            }
            if (!this.channels.has(label)) continue;
            const c = this.channels.get(label);
            if (this.isEmpty(c.channel)) {
              this.log('Could not get Discord channel, channel is not initialized.', label);
              break;
            }
            response.push(c.channel);
          }
        } catch (ex) {
          this.err(ex);
        }
        return response;
      };
      const getChannels = getDiscordChannel();
      if (this.isBlank(getChannels)) {
        this.log('Could not send Discord Message, channels are empty.');
        return;
      }
      if (this.isObj(message) && 'embed' in message) {
        message.embed.footer = message.embed.footer || { text: COPYRIGHT_MESSAGE };
      }
      for (const channel of getChannels) {
        toSend.push(channel.send(message));
      }
    } catch (ex) {
      this.err(ex);
    }
    return Promise.all(toSend);
  }

  /**
   * @type { WDB["setObj"] }
   */
  setObj(objA = {}, objB = {}) {
    objA = objA ?? {};
    objB = objB ?? {};
    for (const [key, value] of Object.entries(objA)) {
      if (!Object.hasOwn(objB, key)) {
        objB[key] = value;
      } else if (typeof value === 'object') {
        this.setObj(value, objB[key]);
      }
    }
    return objB;
  }

  /**
   * @type { WDB["alphabetSoup"] }
   */
  alphabetSoup(str = '') {
    const cleanStr = str.toLowerCase().trim();
    const codePoints = [...cleanStr].map(WatchdogBase.toCodePoint);
    if (this.playerNames.minimum > 0) {
      let i = 0;
      for (const a of this.alphabet) {
        if (codePoints.includes(a)) {
          i++;
          if (i === this.playerNames.minimum) {
            return true;
          }
        }
      }
      return false;
    }
    for (const a of this.alphabet) {
      if (codePoints.includes(a)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @type { WDB["on"] }
   */
  on(events, ...callbacks) {
    try {
      for (const c of this.normalizeTarget(callbacks)) {
        c.bind(this);
      }
      for (const evt of this.normalizeTarget(events)) {
        const trigCalls = (info) => {
          try {
            for (const c of this.normalizeTarget(callbacks)) {
              c(info);
            }
          } catch (ex) {
            this.err(ex);
          }
        };
        this.server.addListener(evt, trigCalls);
      }
    } catch (ex) {
      this.err(ex);
    }
  }

  /**
   * @type { WDB["fowlText"] }
   */
  fowlText(str = '') {
    return this.profanity.filter((p) => {
      const reg = new RegExp(`\\b${p}\\b`);
      return reg.test(str);
    });
  }

  /**
   * @type { WDB["getUniHex"] }
   */
  getUniHex(num) {
    return String.fromCharCode(parseInt(num, 16));
  }

  /**
   * @type { WDB["getData"] }
   */
  getData(str = '') {
    if (typeof str !== 'string') {
      this.err('[getData] "str" must be a type of String');
      return str;
    }
    const cleanStr = str.toLowerCase().trim();
    const codePoints = [...cleanStr].map(WatchdogBase.toCodePoint);
    const codes = codePoints.filter((s) => !this.lineBreaks.includes(s));
    const clean = codePoints
      .filter((s) => !this.ignorePoints.includes(s))
      .map(this.getUniHex)
      .join('');
    const dataStr = codes
      .filter((s) => !this.ignorePoints.includes(s))
      .map(this.getUniHex)
      .join('');
    const antiAvoid = codePoints
      .filter((i) => {
        return i % 2 === 0;
      })
      .every((i) => this.lineBreaks.includes(i));
    return {
      bsDetect: antiAvoid,
      clean,
      code: {
        data: codes,
        raw: codePoints,
        spaces: codePoints.filter((s) => this.lineBreaks.includes(s)),
        unicode: codes
          .filter((s) => s.length >= 3)
          .map((s) => {
            return {
              code: s,
              raw: this.getUniHex(s)
            };
          })
      },
      data: dataStr,
      raw: str
    };
  }

  /**
   * @type { WDB["fowlData"] }
   */
  fowlData(raw = '', badSlurs) {
    const s = this.getData(raw);
    for (const [key, value] of Object.entries(badSlurs)) {
      if (!value.test(s.data)) continue;
      return {
        regexp: value,
        type: key,
        matched: s.data.match(value)[0],
        ...s
      }
    }
    return null;
  }

  /**
   * @type { WDB["clrSpaces"] }
   */
  clrSpaces(str) {
    const resp = [];
    try {
      const arr = str.match(/(\s\w{1})+\W/g) || [];
      if (arr.length > 0) {
        for (const s of arr.map((item) => item.replace(/\s+/g, ''))) {
          if (s.length > 1) {
            resp.push(s);
          }
        }
      }
    } catch (ex) {
      this.err(ex);
    }
    return resp.join(' ');
  }

  /**
   * @type { WDB["badSlurCheck"] }
   */
  badSlurCheck(str, badSlurs) {
    for (const [key, value] of Object.entries(badSlurs)) {
      const m = this.msgMatch(str, value, key);
      if (!m.type) continue;
      return m;
    }
    return {
      matched: '',
      type: null
    };
  }

  /**
   * @type { WDB["toxicityCheck"] }
   */
  toxicityCheck(str, profanity) {
    const regExp = new RegExp(
      `(stfu|asshole|ahole|shit|bitche*)s*(${str}|admin|team(mates*)?|you|u\\W|the(ir|re|y)|\\w{1}(e|im|er))|${profanity}`
    );
    return regExp.test(str);
  }

  /**
   * @type { WDB["toxicityMatch"] }
   */
  toxicityMatch(str, profanity) {
    const regExp = new RegExp(
      `(stfu|asshole|ahole|shit|bitche*})s*(${str}|admin|team(mates*)?|admin|you|u\\W|the(ir|re|y)|\\w{1}(e|im|er))|${profanity}`
    );
    const regMatch = str.match(regExp);
    if (regMatch.length > 0) {
      return regMatch;
    }
    return [];
  }

  /**
   * @type { WDB["trimMsg"] }
   */
  static trimMsg(str = '') {
    if (typeof str === 'string') {
      return str.toLowerCase().replace(/[^a-z0-9\s]|\s{2,}|\t{2,}/g, '');
    }
    return str;
  }

  /**
   * @type { WDB["msgMatch"] }
   */
  msgMatch(rawMessage, matchReg, type = 'Slur') {
    const resp = {
      matched: '',
      type: null
    };
    if (exemptions.test(rawMessage)) {
      return resp;
    }
    const msg = WatchdogBase.trimMsg(rawMessage);
    const spaces = this.clrSpaces(msg);
    // Swastika unicodes
    if (/[\u5350\u534D]+/gu.test(rawMessage)) {
      const spArr = spaces.match(/[\u5350\u534D]+/gu) || [];
      if (spArr.length > 0) {
        resp.matched = spArr[0];
        resp.type = 'Political';
        return resp;
      }
    }
    if (!this.isBlank(spaces)) {
      const spArr = spaces.match(matchReg) || [];
      if (spArr.length > 0) {
        resp.matched = spArr[0];
        resp.type = type;
        return resp;
      }
    }
    const msgArr = msg.match(matchReg) || [];
    if (msgArr.length > 0) {
      resp.matched = msgArr[0];
      resp.type = type;
    }
    return resp;
  }

  /**
   * @type { WDB["toCodePoint"] }
   */
  static toCodePoint(s) {
    return s.codePointAt(0).toString(16);
  }

  /**
   * @type { WDB["objToStr"] }
   */
  objToStr(obj) {
    return Object.prototype.toString.call(obj);
  }

  /**
   * @type { WDB["normalizeTarget"] }
   */
  normalizeTarget(target) {
    if (target === null) {
      return [];
    }
    if (Array.isArray(target)) {
      return target;
    }
    if (target instanceof Map) {
      const arr = [];
      for (const [k, v] of target) {
        arr.push([k, v]);
      }
      return arr;
    }
    if (target instanceof Set) {
      return [...target];
    }
    if (typeof target === 'string') {
      return [target];
    }
    if (Array.from(target).length > 0) {
      return Array.from(target);
    }
    return [target];
  }

  /**
   * @type { WDB["isObj"] }
   */
  isObj(obj, pos = undefined) {
    return this.objToStr(obj).includes('Object', pos);
  }

  /**
   * @type { WDB["isNull"] }
   */
  isNull(obj) {
    return Object.is(obj, null) || Object.is(obj, undefined);
  }

  /**
   * @type { WDB["isBlank"] }
   */
  isBlank(obj) {
    return (
      (typeof obj === 'string' && Object.is(obj.trim(), '')) ||
      ((obj instanceof Set || obj instanceof Map) && Object.is(obj.size, 0)) ||
      (Array.isArray(obj) && Object.is(obj.length, 0)) ||
      (this.isObj(obj) && Object.is(Object.keys(obj).length, 0))
    );
  }

  /**
   * @type { WDB["isEmpty"] }
   */
  isEmpty(obj) {
    return this.isNull(obj) || this.isBlank(obj);
  }

  // #region Formatters
  /**
   * @type { WDB["formatters"] }
   */
  formatters() {
    const fn = {
      bold(content) {
        return `**${content}**`;
      },
      codeBlock(language, content) {
        return content === undefined ? `\`\`\`\n${language}\n\`\`\`` : `\`\`\`${language}\n${content}\n\`\`\``;
      },
      channelLink(channelId, guildId) {
        return `https://discord.com/channels/${guildId ?? '@me'}/${channelId}`;
      },
      formatEmoji(emojiIdOrOptions, animated) {
        const options =
          typeof emojiIdOrOptions === 'string'
            ? {
                id: emojiIdOrOptions,
                animated: animated ?? false
              }
            : emojiIdOrOptions;

        const { id, animated: isAnimated, name: emojiName } = options;

        return `<${isAnimated ? 'a' : ''}:${emojiName ?? '_'}:${id}>`;
      },
      hyperlink(content, url, title) {
        return title ? `[${content}](${url} "${title}")` : `[${content}](${url})`;
      },
      inlineCode(content) {
        return `\`${content}\``;
      },
      messageLink(channelId, messageId, guildId) {
        return `${guildId === undefined ? fn.channelLink(channelId) : fn.channelLink(channelId, guildId)}/${messageId}`;
      },
      time(timeOrSeconds, style) {
        if (typeof timeOrSeconds !== 'number') {
          timeOrSeconds = Math.floor((timeOrSeconds?.getTime() ?? Date.now()) / 1000);
        }
        return typeof style === 'string' ? `<t:${timeOrSeconds}:${style}>` : `<t:${timeOrSeconds}>`;
      }
    };
    return fn;
  }
  // #endregion

  /**
   * @type { WDB["validator"] }
   */
  validator(obj = {}, locate = '') {
    try {
      obj = obj || {};
      if (typeof locate !== 'string') {
        throw new Error('{ locate } needs to be a type of String');
      }
      if (!this.isObj(obj)) {
        throw new Error('{ obj } needs to be a type of Object');
      }
      for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Date) continue;
        if (key === locate) {
          return value;
        } else if (typeof value === 'object') {
          return this.validator(value, locate);
        }
      }
    } catch (ex) {
      this.err(ex);
    }
    return null;
  }

  /**
   * @type { WDB["isValid"] }
   */
  isValid(info = {}, template = '', bol = true) {
    try {
      if (typeof template !== 'string') {
        throw new Error('{ template } needs to be a type of String');
      }
      if (!this.isObj(info)) {
        throw new Error('{ info } needs to be a type of Object');
      }
      if (!bol) {
        return template.replace(templateReg, (_match, root) => {
          const key = this.validator(info, root);
          return this.isNull(key) ? root : key;
        });
      }
      const resp = this.validator(
        info,
        template.replace(templateReg, (_match, root) => {
          return root;
        })
      );
      return resp;
    } catch (ex) {
      this.err(ex, info, template);
    }
    if (!bol) {
      return template;
    }
    return null;
  }

  /**
   * @type { WDB["validName"] }
   */
  validName(info) {
    if (!this.isObj(info)) {
      return 'Undefined Player / Admin';
    }
    const obj = this.validator(info, 'name');
    if (this.isEmpty(obj) || Object.is(obj, 'name')) {
      return 'Undefined Player / Admin';
    }
    return obj;
  }

  /**
   * @type { WDB["embedFormat"] }
   */
  embedFormat(name) {
    const defFormat = {
      player: `[${this.format.hyperlink(
        '{{name}}',
        'https://www.battlemetrics.com/rcon/players?filter[search]={{eosID}}&method=quick&redirect=1',
        'Go to BattleMetrics'
      )}] - [${this.format.hyperlink(
        '{{steamID}}',
        'https://steamcommunity.com/profiles/{{steamID}}',
        'Go to Steam Profile'
      )}]`,
      squad: '{{squadID}} : {{squadName}}',
      team: '{{teamID}} : {{teamName}}'
    };
    if ('name' in this.embedFormats) {
      return this.embedFormats[name];
    }
    if (name in defFormat) {
      return defFormat[name];
    }
    return name;
  }

  /**
   * @type { WDB["validSquad"] }
   */
  validSquad(info) {
    if (!this.isObj(info)) {
      return 'Undefined Squad';
    }
    const format = this.embedFormat('squad');
    const obj = this.isValid(info, format, false);
    if (this.isEmpty(obj) || obj.includes('squadName') || Object.is(obj, format)) {
      return 'Unassigned Squad';
    }
    return obj;
  }

  /**
   * @type { WDB["validSteamID"] }
   */
  validSteamID(info) {
    if (!this.isObj(info)) {
      return 'Undefined SteamID';
    }
    const format = this.embedFormat('player');
    const obj = this.isValid(info, format, false);
    if (this.isEmpty(obj) || Object.is(obj, format)) {
      return 'Undefined SteamID';
    }
    return obj;
  }

  /**
   * @type { WDB["validTeam"] }
   */
  validTeam(info) {
    if (!this.isObj(info)) {
      return 'Undefined Team';
    }
    const format = this.embedFormat('team');
    const obj = this.isValid(info, format, false);
    if (this.isEmpty(obj) || Object.is(obj, format)) {
      return 'Unassigned Team';
    }
    return obj;
  }

  // #region Console Logs
  /**
   * @type { WDB["dbg"] }
   */
  dbg(...msg) {
    console.debug(`${this.prettyPrint(chalk.yellowBright('Debug'))}`, ...msg);
  }

  /**
   * @type { WDB["err"] }
   */
  err(...msg) {
    console.error(`${this.prettyPrint(chalk.redBright('Error'))}`, ...msg);
  }

  /**
   * @type { WDB["log"] }
   */
  log(...msg) {
    console.log(`${this.prettyPrint(chalk.blueBright('Log'))}`, ...msg);
  }

  /**
   * @type { WDB["prettyPrint"] }
   */
  prettyPrint(content) {
    const n = chalk.cyanBright(this.constructor.name);
    return `[${n}]${content ? `[${content}]` : ''}[1]`;
  }
  // #endregion
}

export default WatchdogBase;
