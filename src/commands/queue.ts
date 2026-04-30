import type { Command } from "../types/commands.js";
import { getQueue } from "../services/music-player.js";

export const queueCommand: Command = {
  name: "queue",
  description: "Mostra a fila de músicas",

  async execute(message) {
    const queue = getQueue(message);

    if (!queue.length) {
      await message.reply("📭 A fila está vazia.");
      return;
    }

    const list = queue
      .slice(0, 10)
      .map((item, index) => `${index + 1}. ${item.query}`)
      .join("\n");

    await message.reply(`📜 **Fila atual**\n${list}`);
  },
};