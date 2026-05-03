import type { Command } from "../types/commands.js";
import { lavalink } from "../index.js";

export const skipCommand: Command = {
  name: "skip",
  description: "Pula a música atual",

  async execute(message) {
    const player = message.guild ? lavalink.getPlayer(message.guild.id) : null;

    if (!player) {
      await message.reply("❌ Nada tocando.");
      return;
    }

    await player.skip();
    await message.reply("⏭️ Pulando...");
  },
};