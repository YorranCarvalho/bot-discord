import type { Command } from "../types/commands.js";
import { removeFromQueue } from "../services/music-player.js";

export const removeCommand: Command = {
  name: "remove",
  description: "Remove uma música da fila",

  async execute(message, args) {
    const position = Number(args[0]);

    if (!position) {
      await message.reply("❌ Informe a posição. Exemplo: `.remove 2`");
      return;
    }

    await removeFromQueue(message, position);
  },
};