import type { Command } from "../types/commands.js";
import { setLoopMode } from "../services/music-player.js";

export const loopCommand: Command = {
  name: "loop",
  description: "Controla o loop",

  async execute(message, args) {
    const mode = args[0] as "off" | "song" | "queue";

    if (!["off", "song", "queue"].includes(mode)) {
      await message.reply("❌ Use: `.loop off`, `.loop song` ou `.loop queue`");
      return;
    }

    await setLoopMode(message, mode);
  },
};