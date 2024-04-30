import WatchdogBase from './Watchdog-base-plugin.js';

// #region Profanity List
/**
 * The Racial Slur Database
 * @link http://www.rsdb.org/
 */
const commonSlurs =
  'wet-*back|tar-*bab(y|ies)|sheeny|\\Wcoon|german-*oven-*mitt|rag-*head|(white|black|chin(ese|a)|german|israel)supremacy';
const nWord =
  'n(o|a)gger|negro|nigger|(n|m|y|z)i(g|b)let|(n|m|y|z)i(g|b)(g|b)*(a|er|ol|y)|knee-*grow|^igga|nick(h|gu)er|kneeg';
const blacks = `sambo|baboon|afric(an't|oon)|jigaboo|blackmonkey|${nWord}`;
const whites = 'wigwog|wigg(er|rette|let)|windian|wegro|mud-*shark|wet-*dog';
const mexican =
  '^(chino|chinina)|beaner|\\W(yerd|xarnego|dago|uda)|cannedlabor|fence-*hopper|manuel-*labor|taco-*jockey';
const vietnamese = '(ch|v|g)ink|gook|agentorange';
const german = 'jew|holocaust|schleu|saupreiss|schmeisser|shit-*eater|volkswagen';
const american = 'unclecscam|pindos';
const korean = 'nork|biscuit-*head|chosenjin|shovel-*head|seoulman|kekeke|jughead|dog-*breath';
const mixedRaces = 'soggycracker|spegro';
const arabs = 'sand(monkey|moolie|rat|scratcher)|towel-*head';
const asians =
  '\\W[A-Za-z]ing(\\s-)?[A-Za-z]ong|(buddha|slope|zipper)-*head|dog-*(muncher|eater)|bananame|rice-*(picker|cooker|burner|rocket)|seaweed-*sucker|soyback|squint|yellow-*(devil|monkey)|gink';

/**
 * Ban player without warning
 *
 * Format: `{{name}}: RegExp`
 */
const badSlurs = {
  Ableism:
    /downie|ree*ta?r[dt]|\Wtard|autis(tism|tic)|brain-*damage|schizo|special-*needs|window-*licker|mental(ly)?dis/,
  CurrentEvents: /hamas|pakistan|georgefloyd/,
  Homophobic: /queer|fag(s|t)*|fg{1,}t|f\\w?g{1,}\w?it/,
  Pedophilia: /fuck(.+)?\d(yr|year|y)old/,
  Political: /sieghail|hitler|nazi/,
  // Swastika unicodes
  Unicode: /[\u5350\u534D]+/gu,
  Prejudice: /(hate|fuck|stupid)(\s-)?(hamas|pakistan|america|mexic|canad)/,
  Racism: new RegExp(
    `${commonSlurs}|${american}|${mexican}|${blacks}|${whites}|${vietnamese}|${german}|${korean}|${mixedRaces}|${arabs}|${asians}`
  ),
  Sexism:
    /(fuck|stupid|men>|menare(better|stronger|faster|smarter|greater|cooler)th(e|a)n)(women|girl|female)|stfu.*?(women|girl|female)/,
  Toxicity:
    /mortard|stfu(manchild|admin)|(a|are)cuck|obese|(sqd|squad).*?(stupid|trash|dumbfuck)|(incompetent|lowiq).*?(sqd|squad)/
};
// #endregion

// Chat colors are the same colors that you would find in game
const embedColors = {
  ChatAll: [0, 201, 255],
  ChatAdmin: [13, 228, 228],
  ChatSquad: [63, 255, 0],
  ChatTeam: [28, 172, 222]
};

class Cerberus extends WatchdogBase {
  static get description() {
    return 'Cerberus edition, the most advanced content filter in SquadJS';
  }

  static get defaultEnabled() {
    return true;
  }

  static get optionsSpecification() {
    return {
      ...WatchdogBase.optionsSpecification,
      /** Watchdog supports using the default method `options.channelID` */
      channelIDs: {
        required: false,
        description: 'Array of Discord channelIDs',
        default: [],
        /**
         * @example <caption>Example usage</caption>
         * const message = { content: 'What da dog doin?' }); // Message body.
         * await this.sendDiscordMessage(message); // Send message to the first channel from `options.channelIDs`.
         * await this.sendDiscordMessage(message, 'snoopdog'); // Send message to the specified channel.
         * await this.sendDiscordMessage(message, '117741905338136459'); // Send message to the specified channel id.
         * await this.sendDiscordMessage(message, true); // Send message to all channels.
         */
        example: [
          '117741905338136459',
          {
            label: 'snoopdog',
            id: '667741905228136459',
            /**
             * Optional, use channel name displayed on Discord server instead of `label`.
             */
            useChannelName: false
          }
        ]
      }
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.chatFilter = this.chatFilter.bind(this);
    this.onConnect = this.onConnect.bind(this);

    /**
     * Players chat messages for this session.
     *
     * Added on `PLAYER_CONNECTED` event and `CHAT_MESSAGE` event is used as a fallback.
     *
     * Removed on `NEW_GAME` and `ROUND_ENDED` events.
     * @type {Map<string, {msg: string; formatted: string; timestamp: number;}[]>}
     */
    this.chatMessages = new Map();
  }

  async mount() {
    await super.mount();

    this.on(['NEW_GAME', 'ROUND_ENDED'], () => this.chatMessages.clear());
    this.on(['CHAT_MESSAGE', 'SQUAD_CREATED'], this.chatFilter);
    this.on('PLAYER_CONNECTED', this.onConnect);

    // const message = { content: 'What da dog doin?' };
    // await this.sendDiscordMessage(message);
  }

  async onConnect(info) {
    try {
      const { player } = info;
      const steamID = this.validator(player, 'steamID');
      const playerName = this.validName(player);
      if (typeof steamID !== 'string') {
        return;
      }
      if (typeof playerName !== 'string') {
        return;
      }
      if (!this.chatMessages.has(steamID)) {
        this.chatMessages.set(steamID, []);
      }
      if (!this.alphabetSoup(playerName)) {
        if (this.playerNames.action === 'kick') {
          await this.server.rcon.kick(
            steamID,
            `Please change your username to a minimum of ${this.playerNames.minimum} english characters.`
          );
        }
        await this.sendDiscordMessage({
          content: `${this.actionHead(this.playerNames.action)} Kicked, missing minimum of ${
            this.playerNames.minimum
          } english characters.`,
          embed: {
            fields: [
              {
                name: 'Player',
                value: this.validSteamID(info.player ?? info),
                inline: false
              }
            ],
            color: [255, 0, 0]
          }
        });
        return;
      }
      const dog = this.fowlData(playerName, badSlurs);
      if (dog) {
        await this.sendDiscordMessage({
          content: `${this.actionHead(this.action)} Removed player due to "${dog.type}" in "${dog.matched}"`,
          embed: {
            fields: [
              {
                name: 'Player',
                value: this.validSteamID(info.player ?? info),
                inline: false
              },
              {
                name: 'Words found',
                value: `${dog.matched}`,
                inline: true
              },
              {
                name: 'Raw Message',
                value: `${playerName}`,
                inline: true
              }
            ],
            color: [255, 0, 0]
          },
        });
        if (this.action === 'kick') {
          await this.server.rcon.kick(steamID, `Please change your username due to "${dog.type}" in "${dog.matched}"`);
        } else if (this.action === 'ban') {
          await this.server.rcon.ban(steamID, 0, `Banned by Watchdog ${this.constructor.name} due to "${dog.type}" in "${dog.matched}"`);
        }
      }
    } catch (ex) {
      this.err(ex);
    }
  }

  async chatFilter(info) {
    try {
      const steamID = this.isValid(info, 'steamID');
      if (!steamID) {
        this.err('[chatFilter] Invalid SteamID', info, steamID);
        return;
      }
      if (!this.chatMessages.has(steamID)) {
        this.chatMessages.set(steamID, []);
      }
      const rawMsg = this.isNull(info.chat) ? info.squadName : info.message;
      const dog = this.fowlData(rawMsg, badSlurs);
      if (!this.isNull(info.chat)) {
        const msgHistory = this.chatMessages.get(steamID);
        msgHistory.push({
          msg: rawMsg,
          formatted: `${this.format.time(info.time)} (${info.chat}) ${this.validName(info.name ? info : info.player)}: ${rawMsg}`,
          timestamp: +info.time,
          watchdog: dog
        });
        this.chatMessages.set(steamID, msgHistory);
      }
      if (dog) {
        await this.sendDiscordMessage({
          content: `${this.actionHead(this.action)} Banned for "${dog.type}"`,
          embed: {
            fields: [
              {
                name: 'Player',
                value: this.validSteamID(info.player ?? info),
                inline: false
              },
              {
                name: 'Words found',
                value: `${dog.matched}`,
                inline: true
              },
              {
                name: 'Raw Message',
                value: `${rawMsg}`,
                inline: true
              },
              // {
              //   name: this.isNull(info.chat) ? 'Ban Reason' : 'Chat History',
              //   value: this.joinChatMessages(steamID),
              //   inline: false
              // }
            ],
            color: this.isNull(info.chat) ? [255, 0, 0] : embedColors[info.chat]
          },
        });
        if (this.action === 'kick') {
          await this.server.rcon.kick(
            steamID,
            `Kicked by Watchdog ${this.constructor.name} due to "${dog.type}" in "${dog.matched}"`
          );
        } else if (this.action === 'ban') {
          await this.server.rcon.ban(
            steamID,
            0,
            `Banned by Watchdog ${this.constructor.name} due to "${dog.type}" in "${dog.matched}"`
          );
        }
      }
    } catch (ex) {
      this.err(ex);
    }
  }

  actionHead(action) {
    return `${action === 'none' ? '**`[Just Logging]`** ' : ''}${this.constructor.name}:`;
  }

  joinChatMessages(steamID) {
    return (this.chatMessages.get(steamID) || []).map((item) => item.formatted).join('\n');
  }
}

export default Cerberus;
