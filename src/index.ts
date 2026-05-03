import { Client, GatewayIntentBits, Events } from "discord.js";
import { LavalinkManager } from "lavalink-client";
import "dotenv/config";

import { clearCommand } from "./commands/clear.js";
import { helpCommand } from "./commands/help.js";
import { nowCommand } from "./commands/now.js";
import { pauseCommand } from "./commands/pause.js";
import { playCommand } from "./commands/play.js";
import { queueCommand } from "./commands/queue.js";
import { removeCommand } from "./commands/remove.js";
import { resumeCommand } from "./commands/resume.js";
import { shuffleCommand } from "./commands/shuffle.js";
import { stopCommand } from "./commands/stop.js";
import type { Command } from "./types/commands.js";
import { autoplayCommand } from "./commands/autoplay.js";
import { loopCommand } from "./commands/loop.js";
import { israelCommand } from "./commands/israel.js";
import { russiaCommand } from "./commands/russian.js";
import { perguntaCommand } from "./commands/pergunta.js";
import { womanCommand } from "./commands/woman.js";
import { animeCommand } from "./commands/anime.js";
import { usaCommand } from "./commands/usa.js";
import { warCommand } from "./commands/war.js";
import { skipCommand } from "./commands/skip.js";

const token = process.env.DISCORD_TOKEN;
const PREFIX = ".";

if (!token) {
  throw new Error("DISCORD_TOKEN não foi definido no .env");
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

export const lavalink = new LavalinkManager({
  nodes: [
    {
      id: "main",
      host: "127.0.0.1",
      port: 2333,
      authorization: "yorran123",
      secure: false,
    },
  ],
  sendToShard: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(payload);
  },
  autoSkip: true,
  client: {
    id: "0",
    username: "bot",
  },
});

const commands = new Map<string, Command>();

commands.set(helpCommand.name, helpCommand);
commands.set(playCommand.name, playCommand);
commands.set(skipCommand.name, skipCommand);
commands.set(pauseCommand.name, pauseCommand);
commands.set(resumeCommand.name, resumeCommand);
commands.set(stopCommand.name, stopCommand);
commands.set(queueCommand.name, queueCommand);
commands.set(nowCommand.name, nowCommand);
commands.set(removeCommand.name, removeCommand);
commands.set(clearCommand.name, clearCommand);
commands.set(shuffleCommand.name, shuffleCommand);
commands.set(loopCommand.name, loopCommand);
commands.set(autoplayCommand.name, autoplayCommand);
commands.set(israelCommand.name, israelCommand);
commands.set(russiaCommand.name, russiaCommand);
commands.set(perguntaCommand.name, perguntaCommand);
commands.set(womanCommand.name, womanCommand);
commands.set(animeCommand.name, animeCommand);
commands.set(usaCommand.name, usaCommand);
commands.set(warCommand.name, warCommand);

client.once(Events.ClientReady, (readyClient) => {
  lavalink.init({
    id: readyClient.user.id,
    username: readyClient.user.username,
  });

  console.log(`Bot online como ${readyClient.user.tag}`);
});

client.on("raw", (data) => {
  lavalink.sendRawData(data);
});

lavalink.on("trackStart", (player, track) => {
  if (!track) return;

  const channel = client.channels.cache.get(player.textChannelId || "");

  if (channel?.isSendable()) {
    channel.send(`🎵 Tocando agora: **${track.info.title}**`);
  }
});

lavalink.on("queueEnd", (player) => {
  const channel = client.channels.cache.get(player.textChannelId || "");

  if (channel?.isSendable()) {
    channel.send("✅ Fila finalizada.");
  }

  player.destroy();
});

lavalink.on("trackError", (player, track, payload) => {
  console.error(
    "Erro na track:",
    track?.info?.title ?? "Track desconhecida",
    payload
  );
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = commands.get(commandName);

  if (!command) {
    await message.reply(`❌ Comando não encontrado. Use \`${PREFIX}help\`.`);
    return;
  }

  await command.execute(message, args);
});

client.login(token);