# Discord bots at scale

Writing a discord bot designed to scale is a difficult task. A wide variety of libraries and stacks attempted to remedy this. This paper's goal is to discuss the pro and cons of each approach. While providing tips to improve performance while using them. The hope is to help guide you through this treacherous venture.

<!-- place table of contents here -->

# All clients

## Intents

The simplest way to increase your bot’s performance is to start using Gateway Intents. Intents allow you to select which events Discord will push to your bot. This means that your bot won’t have to spend time processing unused events. Freeing it to perform whatever it’s supposed to. A great price written on this topic is on [Discord.js’s guide](https://discordjs.guide/popular-topics/intents.html#privileged-intents) While it does specifically talk about Gateway Intents in relationship to Discord.js, you can still learn a great deal about them.

## Sharding

Another great way to increase performance is to shard your bot. When your bot reaches a couple of hundred guilds, you will notice that your bot begins to slow, processing data from all of them. Ignoring Discord’s requirement that you shard your bot at ~2,000 guilds, it’s a huge performance boost. Depending on how many guilds are assigned per shard, and how many guilds your bot is in, the difference can either be as clear as day or unnoticeable.

There is a catch though. Unless sharding was implemented from the beginning of a bot’s development, code changes will need to be made. In general, a refactor to searching for guilds, channels, and users will be required. What this looks like though, is entirely dependent upon your framework. So, please refer to your framework’s documentation for any specific changes you will need to make.

## Reducing Caching

In general, reducing needless caching is a good thing. It will decrease the memory footprint of your bot, and may even, though not significantly, decrease the number of cpu cycles required. So basically it will decrease your application’s resource usage. (More detailed information on this topic for your framework might be found later on.)

# Discord.js

## Standard Lib

The standard Discord.js lib is fairly performant out of the box, though not production-ready. (See notice below for info on production readiness.) Though there are some ways to increase your bot's performance.

To start, let’s talking about message caching. In the [client options](https://discordjs.guide/popular-topics/intents.html#privileged-intents) there are quite a few helpful choices in reducing this.

To start, let’s talk about the `messageEditHistoryMaxSize` option. By default, it is set to `-1`, or in other terms, unlimited. What this means is that Discord.js saves every version of a message, and only clears them when the cache sweep clears them. So obviously, unless you use previous versions of messages, this is pretty pointless. In this case, I would personally recommend setting it to `0` so that Discord.js doesn’t ever save previous versions. If you do utilize edited messages, setting it to `1`, or `2` should be plenty.

Next up is `messageCacheMaxSize`. It’s pretty simple, it’s just the number of messages to cache per channel. In general, I recommend `25` compared to the default `200` to decrease the memory footprint. <<<need to look into whether bulk delete method is affected by the message cache>>>

> **Notice:** For any production app, you should in all circumstances utilize both the `messageCacheLifetime` and `messageSweepInterval.`

Up now is `messageCacheLifetime`. It determines how many seconds until a message can be swept. By default it is set to `0`, or Unlimited. I recommend using `21600`s or 6 hours.

The `messageSweepInterval` determines how frequently eligible messages are swept from the cache. The default value is `0`, meaning it will never run. So the recommended value is `43200`s or 12 hours. This allows for proper caching while still sweeping regularly enough to keep memory free.

## Using Discord.js-light

Using Discord.js-light
