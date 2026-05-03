import type { Command } from "../types/commands.js";
import { lavalink } from "../index.js";

export const stopCommand: Command = {
  name: "stop",
  description: "Para a música e limpa a fila",

  async execute(message) {
    const player = message.guild ? lavalink.getPlayer(message.guild.id) : null;

    if (!player) {
      await message.reply("❌ Nada tocando.");
      return;
    }

    player.queue.tracks.splice(0, player.queue.tracks.length);

    await player.destroy();

    await message.reply("⏹️ Parei tudo e limpei a fila.");
  },
};