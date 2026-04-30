import type { Command } from "../types/commands.js";
import { addToQueue } from "../services/music-player.js";

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

    await addToQueue(message, input);
  },
};