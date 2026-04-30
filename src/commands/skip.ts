import type { Command } from "../types/commands.js";
import { skipMusic } from "../services/music-player.js";

export const skipCommand: Command = {
  name: "skip",
  description: "Pula a música atual",

  async execute(message) {
    await skipMusic(message);
  },
};