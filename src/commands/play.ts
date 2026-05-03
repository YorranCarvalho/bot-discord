import type { Command } from "../types/commands.js";
import { ChannelType } from "discord.js";
import { lavalink } from "../index.js";

export const playCommand: Command = {
  name: "play",
  description: "Toca uma música",

  async execute(message, args) {
    const input = args.join(" ");

    if (!input) {
      await message.reply(
        "❌ Envie algo para tocar. Exemplo: `.play System Of A Down A.D.D.`"
      );
      return;
    }

    const voiceChannel = message.member?.voice.channel;

    if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
      await message.reply("❌ Você precisa estar em um canal de voz.");
      return;
    }

    if (!message.guild) return;

    const player =
      lavalink.getPlayer(message.guild.id) ||
      lavalink.createPlayer({
        guildId: message.guild.id,
        voiceChannelId: voiceChannel.id,
        textChannelId: message.channel.id,
        selfDeaf: false,
      });

    await player.connect();

    const result = await player.search(
      {
        query: input,
        source: "youtube",
      },
      message.author
    );

    const track = result.tracks[0];

    if (!track) {
      await message.reply("❌ Não encontrei nada.");
      return;
    }

    await player.queue.add(track);

    if (!player.playing && !player.paused) {
      await player.play();
    } else {
      await message.reply(`✅ Adicionado à fila: **${track.info.title}**`);
    }
  },
};