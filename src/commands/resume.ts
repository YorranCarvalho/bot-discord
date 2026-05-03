import type { Command } from "../types/commands.js";
import { lavalink } from "../index.js";

export const resumeCommand: Command = {
  name: "resume",
  description: "Continua a música pausada",

  async execute(message) {
    const player = message.guild ? lavalink.getPlayer(message.guild.id) : null;

    if (!player) {
      await message.reply("❌ Nada tocando.");
      return;
    }

    await player.resume();
    await message.reply("▶️ Continuando.");
  },
};