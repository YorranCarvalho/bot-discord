import type { Command } from "../types/commands.js";
import { setAutoplay } from "../services/music-player.js";

export const autoplayCommand: Command = {
  name: "autoplay",
  description: "Liga ou desliga autoplay",

  async execute(message, args) {
    const option = args[0];

    if (!["on", "off"].includes(option)) {
      await message.reply("❌ Use: `.autoplay on` ou `.autoplay off`");
      return;
    }

    await setAutoplay(message, option === "on");
  },
};