# SquadJS-Watchdog

> [!IMPORTANT]
> Watchdog is **VERY** fast!
>
> **Watchdog bans are processed faster than BattleMetrics RCON console!**
>
> _If player is banned/kicked for something in chat, it won't appear in BattleMetrics!_

[![GitHub License](https://img.shields.io/github/license/magicoflolis/SquadJS-Watchdog?style=flat-square)](https://github.com/magicoflolis/SquadJS-Watchdog/blob/main/LICENSE)
[![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/magicoflolis/SquadJS-Watchdog?style=flat-square)](https://github.com/magicoflolis/SquadJS-Watchdog/issues)

**UNDER CONSTRUCTION!**

The most advanced content filter in SquadJS. For any issues, see [issue tracker](https://github.com/magicoflolis/SquadJS-Watchdog/issues).

Watchdog is a plugin designed to filter any and all _unwanted_ content a player might enter in chat, squad name, or username. Currently there are **two** different editions.

## Pre-requirements

- Requires setting up a Discord bot.

To avoid running into issues, the `Watchdog-base-plugin.js` **must** be excluded from loading as a plugin. This requires modifying the default plugin loader, `/squad-server/plugins/index.js`.

**Recommended Method:**

- Replace your `/squad-server/plugins/index.js` with the one found in this repo.
  - **This uses a different plugin loading method.**

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
- `action` - Auto mod feature and global action trigger.
  - If `none`, watchdog will only log detected content in discord.
  - If `ban`, watchdog will log detected content in discord then take this action on the player.
  - If `kick`, watchdog will log detected content in discord then take this action on the player.
  - Default is `none`.
- `channelID?` - Works the exact same way as default method.
- `channelIDs?` - An array of channelIDs, this allows you to connect to multiple discord channels under the same plugin!
  - If you don't care to use this feature, input a channelID how you normally would.
- `playerNames` - Define acceptable player names.
  - `action` - Same as global action option listed above.
  - `alphabet` - Alphabet of the language you wish for players to have in there names, basic english characters are the default.
  - `extends` - Extend alphabet system listed above, good if you wish to keep default and extend upon it.
  - `minimum` - The minimum requirements for a player name to have, default is 0 which means a player name must include any characters from `alphabet` or `extends` otherwise the `playerNames:action` is triggered.
    - Example: If set to 3 and a player with the name `AB` joins, the `playerNames:action` is triggered.
- `embedFormat?` - Format player info in embed messages.
- `profanity?` - An array of words you wish not for players to use in chat, player name, or squad name, if found triggers global action.
- `lineBreaks?` - Specify "spaces", used in `this.getData().clean`
  - **Not recommended changing from defaults**
- `ignorePoints?` - Specify ignore characters, used in `this.getData().clean` and `this.getData().data`
  - **Not recommended changing from defaults**

**Base `config.json`:**

```json
{
  "plugins": [
    {
      "plugin": "WatchdogBase",
      "enabled": true,
      "discordClient": "discord",
      "action": "none",
      "channelIDs": [],
      "embedFormat": {
        "player": "[[{{name}}](https://www.battlemetrics.com/rcon/players?filter[search]={{eosID}}&method=quick&redirect=1 'Go to BattleMetrics')] - [[{{steamID}}](https://steamcommunity.com/profiles/{{steamID}} 'Go to Steam Profile')]",
        "squad": "{{squadID}} : {{squadName}}",
        "team": "{{teamID}} : {{teamName}}"
      },
      "playerNames": {
        "action": "none",
        "alphabet": "abcdefghijklmnopqrstuvwxyz1234567890",
        "extends": "",
        "minimum": 0
      },
      "profanity": []
    }
  ]
}
```

## Cerberus edition

> Anything with `?` at the end means it is **optional** and can be removed from the config.

The name **Cerberus** comes from Greek mythology. Cerberus is a multi-headed dog that guards the gates of the Underworld to prevent the dead from leaving.

**Options:**

Extended upon [Watchdog Options](#watchdog)

**Default `config.json`:**

```json
{
  "plugins": [
    {
      "plugin": "Cerberus",
      "enabled": true,
      "discordClient": "discord",
      "action": "none",
      "channelIDs": [],
      "playerNames": {
        "action": "none",
        "alphabet": "abcdefghijklmnopqrstuvwxyz1234567890",
        "extends": "",
        "minimum": 0
      },
      "profanity": []
    }
  ]
}
```

## Molly edition

> Anything with `?` at the end means it is **optional** and can be removed from the config.

The name **Molly** refers to our family dog, she is a english bulldog who has lived for 14 years! Due to her age she has sadly developed a fatal heart condition.

**Pre-requirements:**

- Requires [BattleMetricsAPI](https://github.com/magicoflolis/SquadJS-BattleMetricsAPI) connector.

**Options:**

Extended upon [Watchdog Options](#watchdog)

- `bmClient` - BattleMetrics connector name.
- `Ban?` - BattleMetrics ban info.

**Default `config.json`:**

```json
{
  "plugins": [
    {
      "plugin": "Molly",
      "enabled": true,
      "bmClient": "BattleMetrics",
      "action": "none",
      "Ban": {
        "note": "Banned by Watchdog Molly",
        "reason": "{{reason}} | {{timeLeft}}"
      },
      "channelIDs": [],
      "playerNames": {
        "action": "none",
        "alphabet": "abcdefghijklmnopqrstuvwxyz1234567890",
        "extends": "",
        "minimum": 0
      },
      "profanity": []
    }
  ]
}
```
