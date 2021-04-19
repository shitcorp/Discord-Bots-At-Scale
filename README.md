# Discord bots at scale

Writing a discord bot designed to scale is a difficult charge. A wide variety of solutions have been created to help remedy this issue. This gives you the developer the ability to choose a preferred solution for your workload. But, that last statement was a falsehood because it's just an illusion.
To most readers, you are likely locked into a specific framework, and can't move. Hence, you need to increase performance without going insane. This paper's goal is to help increase performance no matter the framework. Whether that be slight setting changes, or adding entire libraries, there is performance to gain.

# Table of Contents

- [All Clients](#All-clients)
  - [Intents](#Intents)
  - [Sharding](#Sharding)
  - [Reducing Caching](#Reducing-Caching)
- [Discord.js](#Discord.js)
  - [Standard Lib](#Standard-Lib-Discord.js)
  - [Using Discord.js-light](#Using-Discord.js-light)
  - [Kurasuta](#Kurasuta)
- [Eris](#Eris)
  - [Standard Lib](#Standard-Lib-Eris)
  - [Eris-fleet](#Eris-fleet)
  - [Redis-sharder](#Redis-sharder)
  - [Eris-sharder](#Eris-sharder)
  - [Megane](#Megane)
- [WeatherStack](#WeatherStack)
- [Twilight](#Twilight)
- [Serenity](#Serenity)
- [Spectacles](#Spectacles)

# All clients

The following subsections are a series of improvements that you should be complete with some respect for every client. What it looks like in terms of performance can vary drastically and depends entirely on the client. When comparing performance between all the differnt libraries and stacks, the language of each should be kept in mind. For example, comparing a pure Node.js client to a fullstack rust bot isn't fair. As such comparisons of performance gains in such scenarios should be taken with a grain of salt.

## Intents

The simplest way to increase your bot’s performance is to start using Gateway Intents. Intents allow you to select which events Discord will push to your bot. This means that your bot won’t have to spend time processing unused events. Freeing it to perform whatever it’s supposed to. A great price written on this topic is on [Discord.js’s guide](https://discordjs.guide/popular-topics/intents.html#privileged-intents) While it does specifically talk about Gateway Intents in relationship to Discord.js, you can still learn a great deal about them.

## Sharding

Another great way to increase performance is to shard your bot. When your bot reaches a couple of hundred guilds, you will notice that your bot begins to slow, processing data from all of them. Ignoring Discord’s requirement that you shard your bot at ~2,000 guilds, it’s a huge performance boost. Depending on how many guilds are assigned per shard, and how many guilds your bot is in, the difference can either be as clear as day or unnoticeable.

There is a catch though. Unless sharding was implemented from the beginning of a bot’s development, code changes will need to be made. In general, a refactor to searching for guilds, channels, and users will be required. What this looks like though, is entirely dependent upon your framework. So, please refer to your framework’s documentation for any specific changes you will need to make.

## Reducing Caching

In general, reducing needless caching is a good thing. It will decrease the memory footprint of your bot, and may even, though not significantly, decrease the number of cpu cycles required. So basically it will decrease your application’s resource usage. (More detailed information on this topic for your framework might be found later on.)

# Discord.js

> **⚠ Notice ⚠:** For any production app, you must in all circumstances utilize both the `messageCacheLifetime` and `messageSweepInterval` options. Without chnaging these settings a memory leak is guaranteed to occour! Change these settings from default immediately!

## Standard Lib Discord.js

The standard [Discord.js](https://discord.js.org/) lib is fairly performant out of the box, though not production-ready. (See notice below for info on production readiness.) Though there are some ways to increase your bot's performance with no trade-offs.

To start, lets talking about message caching. In the [client options](https://discordjs.guide/popular-topics/intents.html#privileged-intents) there are quite a few helpful choices in reducing this.

To start, let’s talk about the `messageEditHistoryMaxSize` option. By default, it is set to `-1`, or in other terms, unlimited. What this means is that Discord.js saves every version of a message, and only clears them when the cache sweep clears them. So obviously, unless you use previous versions of messages, this is pretty pointless. In this case, I would personally recommend setting it to `0` so that Discord.js doesn’t ever save previous versions. If you do utilize edited messages, setting it to `1`, or `2` should be plenty.

Next up is `messageCacheMaxSize`. It’s pretty simple, it’s just the number of messages to cache per channel. In general, I recommend `25` compared to the default `200` to decrease the memory footprint. <<<need to look into whether bulk delete method is affected by the message cache>>>

Up now is `messageCacheLifetime`. It determines how many seconds until a message can be swept. By default, it is set to `0`, or Unlimited. I recommend using `21600`s or 6 hours.

The `messageSweepInterval` determines how frequently eligible messages are swept from the cache. The default value is `0`, meaning it will never run. So the recommended value is `43200`s or 12 hours. This allows for proper caching while still sweeping regularly enough to keep memory free.

## Using Discord.js-light

Using [Discord.js-light](https://github.com/timotejroiko/discord.js-light) is almost exactly like using Discord.js normally. In fact, Discord.js-light is just a modified of Discord.js. What makes Discord.js-light so powerful then is its focus on reducing caching. As briefly touched on [directly above](#Standard-Lib) and in [Reducing Caching](#Reducing-Caching), its simply stated that caching can have a performance penalty on your application.

![Graph detailing the impact of caching](https://raw.githubusercontent.com/timotejroiko/discord.js-light/HEAD/bench.png)
(Credit to Timotej Rojko, the maker of Discord.js-light for this graph.)

"By disabling all major caches we were able to reduce memory usage from ~500mb to less than 20mb." ([Discord.js-light](https://github.com/timotejroiko/discord.js-light#the-impact-of-caching)) This is a massive drop, reducing the caching of an application can significantly decrease its memory usage, allowing for your bot to handle more guilds.

While reducing caching is nice, Discord.js-light does have some drawbacks like all things. To start, working with the new caching system might be confusing to some less experienced developers. The learning curve shouldn't be too hard, you just need to be willing to read the documentation. Another draw back is converting an existing bot to Discord.js-light. Due to the reworked caching api, it will likely take some extensive probing and testing of your bot to weed out any caching related hiccups.

## Kurasuta

[Kurasuta](https://github.com/DevYukine/Kurasuta) is probably the best way to get free performance from your Discord.js bot. Unlike Discord.js-light, which replaces the Discord.js library, Kurasuta is a replacement sharding manager. What makes it so powerful compared to Discord.js's built-in manager is its ability to cluster shards. Kurasuta can distribute the load of shards across CPU cores instead of relying upon one.

The one trade-off when using Kurasuta is that the main bot file must be formatted in a specific way. For example, in the main bot file, the bot must utilize and expose a Class specified by Kurasuta. This shouldn't be a huge issue and might require some refactoring in existing bots, but it is largely worth it. Another downside is the refactored API. Due to how messages are passed between clusters, and consequently shards, the shard API had to be changed. Hence, you are at the mercy of the customized shard API listed [here](https://github.com/DevYukine/Kurasuta#shardclientutil).

A huge plus for Kurasuta is the ability to specify a custom Discord.js client, such as Discord.js-light. The types for this feature aren't great, and you might have to typecast if you are using TS, but as stated above in the [piece on](#Using-Discord.js-light) Discord.js-light, the gains are worth it.

# Eris

## Standard Lib Eris

The methods of making the standard [Eris](https://abal.moe/Eris/) library more performant has already been discussed for the most part in different contexts. As such, and with all of these libraries, please refer to the [all clients](#All-clients) section for these improvements. A tidbit on this topic is that Eris does not explicitly allow for the reduction of caching. As of right now, you are required to manually set the cache collection size to `0` or whatever max value you want. (There is a [feature request](https://github.com/abalabahaha/eris/issues/1174) to change this.)

## Eris-fleet

[Eris-fleet](https://github.com/danclay/eris-fleet/) is based on a very similar to that of [Kurasuta](#Kurasuta). Eris-fleet is similar in that it can distribute a load of shards across multiple CPU cores. Unlike [Eris-sharder](#Eris-sharder) and [Megane](#Megane), on which is it based off of, it feels more like production software. This is due to its support for custom Eris clients, and a wide variety of utils like those of its messaging system.

Eris-fleet's messaging system has all the standard features that one would expect from ipc, and even more. For example, Eris-fleet has an entire set of ipc utils dedicated to managing both clusters and services. You can restart and shut down all clusters and services, as well as reshard all clusters. These out-of-the-box production tools keep your bot running while updating, or handling all the recent growth you've gotten.

Now, at this point, something called `services` has been brought up a good bit, and you're probably wondering what they are. In effect, they are a distributed system of "workers" of which you can program to handle all sorts of tasks. They are very similar in concept to the worker in systems like rabbitmq. bullmq, redis, bistro, and kafka. Whether you have it handling cmds, fetching data, performing fluid simulations, or training a tensorflow ai, it can handle it. You just need to deal with the [constraints of ipc](http://www.ipcinfo.org/ipc-manual-interactive/overview/16-key-challenges-and-limitations/en/). If a distributed system is something you are interested in, try checking out a few of the microservice-based/capable systems like [Twilight](#Twilight), [WeatherStack](#WeatherStack), and [Spectacles](#Spectacles). Or, why bother with the gateway when you can just take in slash commands via http and use a load balancer like nginx or traefik.

## Redis-sharder

> **⚠ Notice ⚠:** Redis Sharder is no longer maintained.

[Redis Sharder](https://github.com/arcanebot/redis-sharder).

## Eris-sharder

[Eris-sharder](https://github.com/discordware/eris-sharder) is bassicly Eris-fleet. Not sure why you might want to use it besides it being an alterative to Eris-fleet.

## Megane

[Megane](https://github.com/brussell98/megane) is in the same situation as Eris-sharder. Not sure why you might want to use it besides it being an alterative to Eris-fleet.

# WeatherStack

> **⚠ Notice ⚠:** The entirty of the WeatherStack appears to have been abandoned.

Due to it be sprawling not well documented, a list of its components can be found [here](https://gist.github.com/Huskydog9988/4323a9fe8d6a8997404df52c91b964c6).

# Twilight

[Twilight](https://twilight.rs/).

# Serenity

[Serenity](https://crates.io/crates/serenity)

# Spectacles

[Spectacles](https://spec.pleb.xyz/#/)
