# SquadJS-Watchdog

> [!IMPORTANT]
> Watchdog is **VERY** fast!
>
> **Watchdog bans are processed faster than BattleMetrics RCON console!**
>
> *If player is banned/kicked for something in chat, it won't appear in BattleMetrics!*

[![GitHub License](https://img.shields.io/github/license/magicoflolis/SquadJS-Watchdog?style=flat-square)](https://github.com/magicoflolis/SquadJS-Watchdog/blob/main/LICENSE)
[![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/magicoflolis/SquadJS-Watchdog?style=flat-square)](https://github.com/magicoflolis/SquadJS-Watchdog/issues)

**UNDER CONSTRUCTION!**

The most advanced content filter in SquadJS. For any issues, see [issue tracker](https://github.com/magicoflolis/SquadJS-Watchdog/issues).

Watchdog is a plugin designed to filter any and all _unwanted_ content a player might enter in chat, squad name, or username. Currently there are **two** different editions.

**Default `config.json`:**

> **PICK ONE!**

```json
{
  "plugins": [
    {
      "plugin": "Cerberus",
      "enabled": true,
      "discordClient": "discord",
      "autoBan": false,
      "channelIDs": []
    },
    {
      "plugin": "Molly",
      "enabled": true,
      "bmClient": "BattleMetrics",
      "discordClient": "discord",
      "autoBan": false,
      "channelIDs": []
    }
  ]
}
```

## Pre-requirements

Requires setting up a Discord bot.

To avoid running into issues, the `Watchdog-base-plugin.js` **must** be excluded from loading as a plugin. This requires modifying the default plugin loader, `/squad-server/plugins/index.js`.

**Recommended Method:**

- Replace your `/squad-server/plugins/index.js` with the one found in this repo.
- **This uses a different plugin loading method.**
  - This method will exclude all non js files and use this regexp `index|base-(plugin|message)`

**Alternative Method:**

- From this repo, copy `/squad-server/plugins/index.js.disabled` to your `/squad-server/plugins`.
- Remove the old `index.js` file.
- Rename `index.js.disabled` to `index.js`.

**Manual Method:**

- Add `Watchdog-base-plugin.js` to line: 31 in `/squad-server/plugins/index.js`.

## Watchdog

> Anything with `?` at the end means it is **optional** and can be removed from the config.

This is the base plugin known as "watchdog", it comes with a ton of utility functions and is made to be extended upon!

**Options:**

- `discordClient` - Discord client
- `autoBan?` - If you do not want the watchdog to auto ban players.
  - If `false`, the plugin will only log detected content in discord.
  - If `true`, the plugin will log detected content in discord then take action on the player.
  - Default is `false`.
- `channelID?` - Works the exact same way as default method.
- `channelIDs?` - An array of channelIDs, this allows you to connect to multiple discord channels under the same plugin!
  - If you don't care to use this feature, input a channelID how you normally would.
- `alphabet?` - Define your language!
  - This can be used to determine what player names you wish not to join your server.
  - If default, only players with `A-Z` and `0-9` in there name can join your server.
  - Default `abcdefghijklmnopqrstuvwxyz1234567890`. No need to include capital letters.
- `embedInfo?` - Server info for embed messages.
- `profanity?` - An array of words you wish not for players to use.
- `lineBreaks?` - Specify "spaces", used in `this.getData().clean`
  - **Not recommended changing from defaults**
- `ignorePoints?` - Specify ignore characters, used in `this.getData().clean` and `this.getData().data`
  - **Not recommended changing from defaults**

## Cerberus edition

> Anything with `?` at the end means it is **optional** and can be removed from the config.

The name **Cerberus** comes from Greek mythology. Cerberus is a multi-headed dog that guards the gates of the Underworld to prevent the dead from leaving.

**Options:**

Extended upon [Watchdog Options](#watchdog)

## Molly edition

> Anything with `?` at the end means it is **optional** and can be removed from the config.

The name **Molly** refers to our family dog, she is a english bulldog who has lived for 14 years! Due to her age she has sadly developed a fatal heart condition.

**Pre-requirements:**

- Requires [SquadJS-BattleMetricsAPI](https://github.com/magicoflolis/SquadJS-BattleMetricsAPI).

**Options:**

Extended upon [Watchdog Options](#watchdog)

- `bmClient` - BattleMetrics connector name.
- `Ban?` - BattleMetrics ban info
