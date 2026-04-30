import type { Command } from "../types/commands.js";
import { getNowPlaying } from "../services/music-player.js";

export const nowCommand: Command = {
  name: "now",
  description: "Mostra a música atual",

  async execute(message) {
    const current = getNowPlaying(message);

    if (!current) {
      await message.reply("❌ Nada tocando agora.");
      return;
    }

    await message.reply(`🎵 Tocando agora: **${current.query}**`);
  },
};