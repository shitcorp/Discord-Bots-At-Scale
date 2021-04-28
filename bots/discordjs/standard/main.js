const { Client } = require("discord.js");
const client = new Client({
  ws: { intents: ["GUILD_MESSAGES"] },
  messageEditHistoryMaxSize: 1,
  messageCacheMaxSize: 25,
  messageCacheLifetime: 21600,
  messageSweepInterval: 43200,
});

client.on("ready", () => {
  console.log("Hello World");
});

client.on("message", (message) => {
  if (message.content === "ping") {
    message.channel.send("pong");
  }
});

client.login(process.env.TOKEN);
